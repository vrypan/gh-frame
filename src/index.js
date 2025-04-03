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
        const branchName = core.getInput('branch_name') || 'gh-frame';
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
        let readmeContent;
        try {
            readmeContent = fs.readFileSync(readmePath, 'utf8');
            if (!readmeContent.trim()) {
                core.warning('README.md is empty, using default content');
                readmeContent = `# ${repoData.data.name}\n\n${repoData.data.description || 'No description provided.'}`;
            }
        } catch (error) {
            core.warning('README.md not found or cannot be read, using default content');
            readmeContent = `# ${repoData.data.name}\n\n${repoData.data.description || 'No description provided.'}`;
        }
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

        // Write files to disk
        const files = {
            'index.html': finalHtml,
            'styles.css': fs.readFileSync(path.join(__dirname, 'styles.css'), 'utf8')
        };

        // Check for downloaded images in the current directory
        const currentDir = process.cwd();
        const imageFiles = ['og-image.png', 'splash-image.png'];
        for (const imageFile of imageFiles) {
            const imagePath = path.join(currentDir, imageFile);
            if (fs.existsSync(imagePath)) {
                files[imageFile] = fs.readFileSync(imagePath);
                core.info(`Found ${imageFile} in current directory`);
            } else {
                core.warning(`Warning: ${imageFile} not found. Skipping image file.`);
            }
        }

        // Write all files to disk
        for (const [filePath, content] of Object.entries(files)) {
            fs.writeFileSync(filePath, content);
            core.info(`Created ${filePath}`);
        }

        // Create CNAME file if provided
        if (cname) {
            fs.writeFileSync('CNAME', cname);
            core.info('Created CNAME file');
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