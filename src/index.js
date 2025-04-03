const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const Handlebars = require('handlebars');

async function run() {
    try {
        const cname = core.getInput('cname');
        const token = core.getInput('token') || process.env.GITHUB_TOKEN;
        const octokit = github.getOctokit(token);
        const context = github.context;

        // Get repository information
        const { owner, repo } = context.repo;
        
        // Get repository and owner details
        const [repoData, userData] = await Promise.all([
            octokit.rest.repos.get({
                owner,
                repo
            }),
            octokit.rest.users.getByUsername({
                username: owner
            })
        ]);

        // Generate the site URL
        const siteUrl = cname ? `https://${cname}` : `https://${owner}.github.io/${repo}`;

        // Read README.md
        const readmePath = path.join(process.env.GITHUB_WORKSPACE, 'README.md');
        const readmeContent = fs.readFileSync(readmePath, 'utf8');
        const htmlContent = marked(readmeContent);

        // Read template
        const templatePath = path.join(__dirname, 'template.html');
        const templateContent = fs.readFileSync(templatePath, 'utf8');
        const template = Handlebars.compile(templateContent);

        // Generate the final HTML
        const finalHtml = template({
            title: repoData.data.name,
            description: repoData.data.description,
            content: htmlContent,
            ogImageUrl: `${siteUrl}/og-image.png`,
            splashImageUrl: `${siteUrl}/splash-image.png`,
            currentUrl: siteUrl
        });

        // Create or update the index.html file
        const branchName = core.getInput('branch_name') || 'gh-frame';
        const indexPath = 'index.html';

        try {
            // Try to get the current file
            const { data: currentFile } = await octokit.rest.repos.getContent({
                owner,
                repo,
                path: indexPath,
                ref: branchName
            });

            // Update the file
            await octokit.rest.repos.createOrUpdateFileContents({
                owner,
                repo,
                path: indexPath,
                message: 'Update index.html',
                content: Buffer.from(finalHtml).toString('base64'),
                sha: currentFile.sha,
                branch: branchName
            });
        } catch (error) {
            if (error.status === 404) {
                // File doesn't exist, create it
                await octokit.rest.repos.createOrUpdateFileContents({
                    owner,
                    repo,
                    path: indexPath,
                    message: 'Create index.html',
                    content: Buffer.from(finalHtml).toString('base64'),
                    branch: branchName
                });
            } else {
                throw error;
            }
        }

        core.info(`\nTo complete setup (one-time step):
1. Go to your repository's Settings
2. Navigate to Pages (in the left sidebar)
3. Under "Branch", select "${branchName}"
4. Click Save

Your page will be available at: ${siteUrl}`);

        core.setOutput('url', siteUrl);
    } catch (error) {
        core.setFailed(error.message);
    }
}

run(); 