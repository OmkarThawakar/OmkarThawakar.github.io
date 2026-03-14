with open('/Users/omkarthawakar/OmkarThawakar.github.io/publications.html', 'r') as f:
    content = f.read()

css_addition = """    .pub-link-arxiv {
      color: #b31b1b;
      border-color: #e5c3c3;
      background-color: #fcf4f4;
    }

    .pub-link-arxiv:hover {
      background-color: #b31b1b;
      color: #ffffff;
      border-color: #b31b1b;
    }

    .pub-link-github {
      color: #24292f;
      border-color: #d0d7de;
      background-color: #f6f8fa;
    }

    .pub-link-github:hover {
      background-color: #24292f;
      color: #ffffff;
      border-color: #24292f;
    }
  </style>"""

content = content.replace("  </style>", css_addition)

content = content.replace('class="pub-link-btn" target="_blank"><i class="fas fa-file-pdf"></i> arXiv', 'class="pub-link-btn pub-link-arxiv" target="_blank"><i class="fas fa-file-pdf"></i> arXiv')
content = content.replace('class="pub-link-btn" target="_blank"><i class="fab fa-github"></i> GitHub', 'class="pub-link-btn pub-link-github" target="_blank"><i class="fab fa-github"></i> GitHub')


with open('/Users/omkarthawakar/OmkarThawakar.github.io/publications.html', 'w') as f:
    f.write(content)

print("Done")
