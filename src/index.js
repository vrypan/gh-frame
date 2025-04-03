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

        // Read README.md
        const readmePath = path.join(process.env.GITHUB_WORKSPACE, 'README.md');
        const readmeContent = fs.readFileSync(readmePath, 'utf8');

        // Convert markdown to HTML
        const htmlContent = marked(readmeContent);

        // Read and compile template
        const templatePath = path.join(__dirname, 'template.html');
        const templateContent = fs.readFileSync(templatePath, 'utf8');
        const template = Handlebars.compile(templateContent);

        // Generate final HTML
        const finalHtml = template({
            title: 'Documentation',
            content: htmlContent
        });

        // Get repository information
        const { owner, repo } = context.repo;

        // Create or update gh-frame branch
        const branchName = 'gh-frame';
        let branchRef;

        try {
            // Try to get the branch
            const { data: ref } = await octokit.rest.git.getRef({
                owner,
                repo,
                ref: `heads/${branchName}`
            });
            branchRef = ref;
        } catch (error) {
            if (error.status === 404) {
                // Branch doesn't exist, create it
                const { data: mainBranch } = await octokit.rest.git.getRef({
                    owner,
                    repo,
                    ref: 'heads/main'
                });

                await octokit.rest.git.createRef({
                    owner,
                    repo,
                    ref: `refs/heads/${branchName}`,
                    sha: mainBranch.object.sha
                });
            } else {
                throw error;
            }
        }

        // Create or update files
        const files = {
            'index.html': finalHtml,
            'styles.css': fs.readFileSync(path.join(__dirname, 'styles.css'), 'utf8')
        };

        if (cname) {
            files['CNAME'] = cname;
        }

        // Create a tree with the new files
        const treeItems = Object.entries(files).map(([path, content]) => ({
            path,
            mode: '100644',
            type: 'blob',
            content
        }));

        const { data: tree } = await octokit.rest.git.createTree({
            owner,
            repo,
            tree: treeItems,
            base_tree: branchRef ? branchRef.object.sha : undefined
        });

        // Create a commit
        const { data: commit } = await octokit.rest.git.createCommit({
            owner,
            repo,
            message: 'Update static page',
            tree: tree.sha,
            parents: branchRef ? [branchRef.object.sha] : []
        });

        // Update the branch reference
        await octokit.rest.git.updateRef({
            owner,
            repo,
            ref: `heads/${branchName}`,
            sha: commit.sha,
            force: true
        });

        // Configure GitHub Pages
        try {
            await octokit.rest.repos.updateBranchProtection({
                owner,
                repo,
                branch: branchName,
                required_status_checks: null,
                enforce_admins: false,
                restrictions: null,
                allow_force_pushes: true,
                allow_deletions: false,
                required_pull_request_reviews: null
            });
        } catch (error) {
            core.warning('Could not configure branch protection: ' + error.message);
        }

        try {
            await octokit.rest.repos.updateInformationAboutPagesSite({
                owner,
                repo,
                source: {
                    branch: branchName,
                    path: '/'
                }
            });
            core.info(`GitHub Pages configured! Site will be available at https://${owner}.github.io/${repo}`);
        } catch (error) {
            core.warning('Could not configure GitHub Pages: ' + error.message);
        }

        core.info('Static page updated successfully!');

    } catch (error) {
        core.setFailed(error.message);
    }
}

run(); 