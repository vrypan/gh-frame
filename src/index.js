const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const Handlebars = require('handlebars');
const puppeteer = require('puppeteer');

async function generateImage(template, data, width, height) {
    const templatePath = path.join(__dirname, template);
    const templateContent = fs.readFileSync(templatePath, 'utf8');
    const compiledTemplate = Handlebars.compile(templateContent);
    const html = compiledTemplate(data);

    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width, height });
    await page.setContent(html);
    const imageBuffer = await page.screenshot({
        type: 'png'
    });
    await browser.close();

    return imageBuffer;
}

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

        // Generate OG image and splash image
        const imageData = {
            title: repoData.data.name,
            description: repoData.data.description,
            username: `@${userData.data.login}`,
            avatarUrl: userData.data.avatar_url
        };

        const [ogImageBuffer, splashImageBuffer] = await Promise.all([
            generateImage('og-template.html', imageData, 1200, 800),
            generateImage('splash-template.html', {
                title: repoData.data.name,
                avatarUrl: userData.data.avatar_url
            }, 200, 200)
        ]);

        // Generate the site URL
        const siteUrl = cname ? `https://${cname}` : `https://${owner}.github.io/${repo}`;

        // Create blobs for the images
        const [ogImageBlob, splashImageBlob] = await Promise.all([
            octokit.rest.git.createBlob({
                owner,
                repo,
                content: ogImageBuffer.toString('base64'),
                encoding: 'base64'
            }),
            octokit.rest.git.createBlob({
                owner,
                repo,
                content: splashImageBuffer.toString('base64'),
                encoding: 'base64'
            })
        ]);

        // Read README.md
        const readmePath = path.join(process.env.GITHUB_WORKSPACE, 'README.md');
        const readmeContent = fs.readFileSync(readmePath, 'utf8');

        // Convert markdown to HTML
        const htmlContent = marked(readmeContent);

        // Read and compile template
        const templatePath = path.join(__dirname, 'template.html');
        const templateContent = fs.readFileSync(templatePath, 'utf8');
        const template = Handlebars.compile(templateContent);

        // Generate final HTML with image URLs
        const finalHtml = template({
            title: repoData.data.name,
            description: repoData.data.description || '',
            content: htmlContent,
            currentUrl: siteUrl,
            ogImageUrl: `${siteUrl}/og-image.png`,
            splashImageUrl: `${siteUrl}/splash-image.png`
        });

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

        // Create tree items including images
        const files = {
            'index.html': {
                content: finalHtml,
                type: 'blob',
                mode: '100644'
            },
            'styles.css': {
                content: fs.readFileSync(path.join(__dirname, 'styles.css'), 'utf8'),
                type: 'blob',
                mode: '100644'
            },
            'og-image.png': {
                sha: ogImageBlob.data.sha,
                type: 'blob',
                mode: '100644'
            },
            'splash-image.png': {
                sha: splashImageBlob.data.sha,
                type: 'blob',
                mode: '100644'
            }
        };

        if (cname) {
            files['CNAME'] = {
                content: cname,
                type: 'blob',
                mode: '100644'
            };
        }

        // Create tree items
        const treeItems = Object.entries(files).map(([path, file]) => ({
            path,
            mode: file.mode,
            type: file.type,
            ...(file.sha ? { sha: file.sha } : { content: file.content })
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
            message: 'Update static page with generated images',
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

        core.info('Static page updated successfully!');
        core.info(`\nTo complete setup (one-time step):
1. Go to your repository's Settings
2. Navigate to Pages (in the left sidebar)
3. Under "Branch", select "gh-frame"
4. Click Save

Your page will be available at: ${siteUrl}`);

    } catch (error) {
        core.setFailed(error.message);
    }
}

run(); 