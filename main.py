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
        self.branch = os.getenv('BRANCH', 'gh-frame')
        
        # Set up paths relative to the current directory
        self.current_dir = os.getcwd()
        self.readme_path = os.path.join(self.current_dir, 'README.md')
        self.template_path = os.path.join(self.current_dir, 'templates')
        self.output_path = os.path.join(self.current_dir, 'index.html')
        
        # Set up raw base URL for images
        if self.domain:
            self.raw_base_url = f'https://{self.domain}/raw/{self.branch}'
        else:
            self.raw_base_url = f'https://raw.githubusercontent.com/{self.repo_name}/{self.branch}'

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
        template = env.get_template('frame.html')
        
        # Prepare context
        context = {
            'content': html_content,
            'repo_name': self.repo_name,
            'domain': self.domain,
            'branch': self.branch
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
    generator = GitHubFrameGenerator()
    generator.run() 