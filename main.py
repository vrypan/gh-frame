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

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GitHubFrameGenerator:
    def __init__(self):
        self.token = os.getenv('GITHUB_TOKEN', 'test-token')
        self.repo = os.getenv('GITHUB_REPOSITORY', 'test-owner/test-repo')
        self.domain = os.getenv('DOMAIN', '')
        self.branch = os.getenv('BRANCH', 'gh-frame')
        self.owner, self.repo_name = self.repo.split('/') if self.repo else (None, None)
        self.raw_base_url = f"https://raw.githubusercontent.com/{self.owner}/{self.repo_name}/main"
        
        # Set up paths for action and target repositories
        self.action_dir = os.path.join(os.getcwd(), 'action')
        self.target_dir = os.path.join(os.getcwd(), 'target')
        
    def rewrite_image_paths(self, content: str) -> str:
        """Rewrite relative image paths to absolute URLs using raw.githubusercontent.com."""
        # Pattern to match markdown image syntax: ![alt](path)
        pattern = r'!\[([^\]]*)\]\(([^)]+)\)'
        
        def replace_match(match):
            alt_text = match.group(1)
            path = match.group(2)
            
            # Skip if it's already an absolute URL
            if path.startswith(('http://', 'https://')):
                return match.group(0)
                
            # Handle relative paths
            if path.startswith('./'):
                path = path[2:]
            elif path.startswith('/'):
                path = path[1:]
                
            # Construct absolute URL
            absolute_url = f"{self.raw_base_url}/{path}"
            return f'![{alt_text}]({absolute_url})'
            
        return re.sub(pattern, replace_match, content)

    def get_readme_content(self) -> str:
        try:
            readme_path = os.path.join(self.target_dir, 'README.md')
            with open(readme_path, 'r', encoding='utf-8') as f:
                content = f.read()
                if not content.strip():
                    content = "# Welcome to My Repository\n\nThis is a placeholder README."
                # Rewrite image paths
                content = self.rewrite_image_paths(content)
                return content
        except Exception as e:
            logger.error(f"Error reading README.md: {e}")
            raise

    def generate_html(self, content: str) -> str:
        """Convert markdown to HTML and prepare context for template."""
        # Convert markdown to HTML with GFM extensions
        html_content = markdown.markdown(
            content,
            extensions=[
                'fenced_code',
                'tables',
                'codehilite',
                'nl2br',
                'sane_lists',
                'smarty',
                'attr_list',
                'def_list',
                'footnotes',
                'md_in_html',
                'toc'
            ]
        )
        
        # Prepare context for template
        context = {
            'title': f"{self.repo_name} - GitHub Repository",
            'description': "A GitHub repository with Farcaster frame support",
            'content': html_content,
            'site_url': f"https://{self.domain}" if self.domain else f"https://{self.owner}.github.io/{self.repo_name}",
            'og_image': 'og-image.png',
            'splash_image': 'splash-image.png',
            'owner': self.owner,
            'repo': self.repo_name
        }
        
        # Load and render template
        templates_dir = os.path.join(self.action_dir, 'templates')
        env = Environment(loader=FileSystemLoader(templates_dir))
        template = env.get_template('index.html')
        return template.render(**context)

    def save_html(self, html_content: str):
        """Save the generated HTML to index.html in the target repository."""
        try:
            output_path = os.path.join(self.target_dir, 'index.html')
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(html_content)
            logger.info("HTML file generated successfully")
        except Exception as e:
            logger.error(f"Error saving HTML file: {e}")
            raise

    def run(self):
        """Run the complete workflow."""
        try:
            content = self.get_readme_content()
            html_content = self.generate_html(content)
            self.save_html(html_content)
        except Exception as e:
            logger.error(f"Error in run: {e}")
            raise

if __name__ == "__main__":
    generator = GitHubFrameGenerator()
    generator.run() 