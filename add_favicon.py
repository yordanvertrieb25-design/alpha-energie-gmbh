import os
import glob

# HTML files to process
html_files = glob.glob('**/*.html', recursive=True)

link_tag = '<link rel="icon" type="image/x-icon" href="/favicon.ico">'

for file_path in html_files:
    if 'node_modules' in file_path:
        continue
        
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
        
    if 'rel="icon"' in content or 'rel="shortcut icon"' in content:
        continue # Already has a favicon
        
    # Find </head> and insert before it
    if '</head>' in content:
        content = content.replace('</head>', f'    {link_tag}\n</head>')
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Added favicon to {file_path}')
