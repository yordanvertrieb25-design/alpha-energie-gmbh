import os
import glob

html_files = glob.glob('*.html')

for filepath in html_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We want to add the link to the "Rechtliches" section in the footer
    # Find:
    # <li><a href="datenschutz.html">Datenschutz</a></li>
    # <li><a href="impressum.html">Impressum</a></li>
    
    # Let's just insert it after impressum.html
    target = '<li><a href="impressum.html">Impressum</a></li>'
    replacement = '<li><a href="impressum.html">Impressum</a></li>\n                        <li><a href="cookie-einstellungen.html">Cookie-Einstellungen</a></li>'
    
    if target in content and 'cookie-einstellungen.html' not in content:
        content = content.replace(target, replacement)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated {filepath}')
    elif 'cookie-einstellungen.html' in content and filepath != 'cookie-einstellungen.html':
        print(f'Already updated {filepath}')

