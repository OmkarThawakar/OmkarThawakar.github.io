import re

with open('/Users/omkarthawakar/OmkarThawakar.github.io/publications.html', 'r') as f:
    content = f.read()

# 1. Add CSS
css_addition = """    .pub-notes {
      font-size: 0.85rem;
      color: #e67e22;
      /* Highlight color */
      margin-top: 0.25rem;
      font-weight: 600;
    }

    .pub-links {
      display: inline-flex;
      gap: 0.5rem;
      margin-left: 0.75rem;
      font-style: normal;
      vertical-align: middle;
    }

    .pub-link-btn {
      font-size: 0.75rem;
      color: #4b5563;
      text-decoration: none;
      border: 1px solid #d1d5db;
      background-color: #f9fafb;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      transition: all 0.2s;
      font-weight: 500;
      white-space: nowrap;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }

    .pub-link-btn:hover {
      background-color: #e5e7eb;
      color: #111827;
      text-decoration: none;
      border-color: #9ca3af;
    }"""

content = content.replace("""    .pub-notes {
      font-size: 0.85rem;
      color: #e67e22;
      /* Highlight color */
      margin-top: 0.25rem;
      font-weight: 600;
    }""", css_addition)

# 2. Add buttons to existing <div class="pub-venue"> EXCEPT for Patent
parts = content.split('<!-- Patents -->')
publications_part = parts[0]
patents_part = parts[1] if len(parts) > 1 else ""

buttons_html = ' <span class="pub-links"><a href="#" class="pub-link-btn" target="_blank"><i class="fas fa-file-pdf"></i> arXiv</a> <a href="#" class="pub-link-btn" target="_blank"><i class="fab fa-github"></i> GitHub</a></span>'

def add_buttons(match):
    venue_text = match.group(1)
    if 'pub-links' in venue_text:
        return match.group(0)
    # Remove trailing spaces/newlines before appending
    venue_text = venue_text.rstrip()
    return f'<div class="pub-venue">{venue_text}{buttons_html}</div>'

publications_part = re.sub(r'<div class="pub-venue">(.*?)</div>', add_buttons, publications_part, flags=re.DOTALL)

# 3. Add to the ones missing <div class="pub-venue">
missing_venues = [
    'EvoLMM: Self-Evolving Large Multimodal Models with Continuous Rewards',
    'CoVR-R: Reason-Aware Composed Video Retrieval',
    'Mobile-O: Unified Multimodal Understanding & Generation on Mobile',
    'LLM Post-Training: A Deep Dive into Reasoning Large Language Models'
]

for title in missing_venues:
    pattern = rf'(<div class="pub-title">{re.escape(title)}</div>\s*<div class="pub-authors">.*?</div>)'
    replacement = rf'\1\n        <div class="pub-venue">Preprint{buttons_html}</div>'
    publications_part = re.sub(pattern, replacement, publications_part, flags=re.DOTALL)

with open('/Users/omkarthawakar/OmkarThawakar.github.io/publications.html', 'w') as f:
    f.write(publications_part + ('<!-- Patents -->' + patents_part if patents_part else ''))

print("Done")
