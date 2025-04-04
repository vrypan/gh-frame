#!/usr/bin/env python3

import os
import sys
import subprocess
from github import Github
from pathlib import Path
import logging
from typing import Optional
import markdown
from jinja2 import Environment, FileSystemLoader
import re
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GitHubFrameGenerator:
    def __init__(self):
        load_dotenv()
        self.token = os.getenv('GITHUB_TOKEN')
        self.repo_name = os.getenv('GITHUB_REPOSITORY')
        self.domain = os.getenv('DOMAIN', '')
        self.branch = os.getenv('BRANCH', 'main')

        # Set up paths relative to the current directory
        self.current_dir = os.getcwd()
        self.readme_path = os.path.join(self.current_dir, 'README.md')
        self.template_path = os.path.join(self.current_dir, 'templates')
        self.output_path = os.path.join(self.current_dir, 'index.html')


        self.raw_base_url = f'https://raw.githubusercontent.com/{self.repo_name}/main'

    def rewrite_image_paths(self, content):
        # Rewrite relative image paths to absolute URLs
        pattern = r'!\[([^\]]*)\]\(([^)]+)\)'
        def replace_match(match):
            alt_text = match.group(1)
            image_path = match.group(2)
            if not image_path.startswith(('http://', 'https://')):
                image_path = f'{self.raw_base_url}/{image_path}'
            return f'![{alt_text}]({image_path})'
        return re.sub(pattern, replace_match, content)

    def get_readme_content(self):
        try:
            with open(self.readme_path, 'r', encoding='utf-8') as f:
                content = f.read()
            return self.rewrite_image_paths(content)
        except Exception as e:
            print(f"Error reading README.md: {e}")
            raise

    def generate_html(self, content):
        # Convert markdown to HTML
        html_content = markdown.markdown(content, extensions=['fenced_code', 'codehilite'])

        # Load and render template
        env = Environment(loader=FileSystemLoader(self.template_path))
        template = env.get_template('index.html')

        # Get repository name and owner from full repo name
        owner, repo_name = self.repo_name.split('/') if '/' in self.repo_name else ('', '')

        # Determine site URL
        site_url = f"https://{self.domain}" if self.domain else f"https://{owner}.github.io/{repo_name}"

        # Get repository description from GitHub API if token is available
        description = ""
        if self.token:
            try:
                g = Github(self.token)
                repo = g.get_repo(self.repo_name)
                description = repo.description or f"GitHub repository page for {repo_name}"
            except Exception as e:
                logger.warning(f"Could not fetch repository description: {e}")
                description = f"GitHub repository page for {repo_name}"
        else:
            description = f"GitHub repository page for {repo_name}"

        # Prepare context
        context = {
            'content': html_content,
            'repo_name': self.repo_name,
            'domain': self.domain,
            'branch': self.branch,
            'site_url': site_url,
            'title': repo_name.replace('-', ' ').title(),
            'description': description,
            'image_url': f"{site_url}/og-image.png",
            'owner': owner,
            'repo': repo_name
        }

        return template.render(context)

    def save_html(self, html_content):
        with open(self.output_path, 'w', encoding='utf-8') as f:
            f.write(html_content)

    def run(self):
        try:
            content = self.get_readme_content()
            html_content = self.generate_html(content)
            self.save_html(html_content)
            print("Successfully generated frame page")
        except Exception as e:
            print(f"Error in run: {e}")
            raise

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Usage: script.py <readme_path> <template_dir>")
        sys.exit(1)

    readme_path = sys.argv[1]
    template_dir = sys.argv[2]

    generator = GitHubFrameGenerator()
    generator.readme_path = readme_path
    generator.template_path = template_dir
    generator.run()
