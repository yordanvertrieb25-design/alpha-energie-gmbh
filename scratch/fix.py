import glob
import re

count = 0
files = glob.glob('*.html')
print(f'Found {len(files)} files')

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # We replace the specific string. Let's make it a bit flexible with whitespace
    pattern = r'<li class="nav-item has-dropdown">\s*<a href="ueber-uns\.html">Über uns</a>\s*</li>'
    replacement = r'<li class="nav-item">\n                        <a href="ueber-uns.html">Über uns</a>\n                    </li>'
    
    new_content = re.sub(pattern, replacement, content)
    
    if new_content != content:
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content)
        count += 1
        print(f'Fixed {f}')

print(f'Total fixed: {count}')
