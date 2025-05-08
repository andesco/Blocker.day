#!/usr/bin/env node
/**
 * Build script to convert README.md into index.html
 * Usage: node scripts/build-readme.js
 */
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// Paths
const root = process.cwd();
const readmePath = path.join(root, 'README.md');
const outputPath = path.join(root, 'index.html');

// Read README.md
const markdown = fs.readFileSync(readmePath, 'utf-8');

// Convert markdown to HTML
marked.setOptions({ breaks: true });
const contentHtml = marked.parse(markdown);

// Build full HTML document
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blocker.day — calendar block generator</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/github.min.css">
  <style>
    body {
      box-sizing: border-box;
      min-width: 200px;
      max-width: 980px;
      margin: 0 auto;
      padding: 45px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    }
    @media (max-width: 767px) {
      body { padding: 15px; }
    }
  </style>
</head>
<body class="markdown-body">
  ${contentHtml}
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js"></script>
  <script>
    // Generate a fresh random seed for each page load
    const seed = Array.from(crypto.getRandomValues(new Uint8Array(4)))
      .map(b => b.toString(16).padStart(2, '0')).join('');
    document.body.innerHTML = document.body.innerHTML.replace(/random-seed-value/g, seed);
    document.querySelectorAll('pre code').forEach(block => hljs.highlightBlock(block));
  </script>
</body>
</html>`;

// Write index.html
fs.writeFileSync(outputPath, html, 'utf-8');
console.log(`Built ${outputPath} from ${readmePath}`);