import glob
import re

files = glob.glob('*.html')
count_b2b = 0
count_portal = 0

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    new_content = content
    
    pattern_b2b = re.compile(r'\s*<a href="b2b-portal\.html" class="btn btn-outline">B2B-Portal</a>')
    if pattern_b2b.search(new_content):
        new_content = pattern_b2b.sub('', new_content)
        count_b2b += 1
        
    if f == 'portal-dashboard.html':
        # Remove profile pictures in portal-dashboard.html
        new_content = re.sub(r'\s*<img src="https://i\.pravatar\.cc/100\?img=5" alt="Erika Schmidt" class="w-10 h-10 rounded-full mr-4">', '', new_content)
        new_content = re.sub(r'\s*<img src="https://i\.pravatar\.cc/100\?img=12" alt="Felix Weber" class="w-10 h-10 rounded-full mr-4">', '', new_content)
        new_content = re.sub(r'\s*<img src="https://i\.pravatar\.cc/100\?img=13" alt="Thomas Wagner" class="w-10 h-10 rounded-full mr-4">', '', new_content)
        count_portal = 1

    if new_content != content:
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content)

print(f"Removed B2B-Portal button from {count_b2b} files.")
print(f"Removed profile pictures from portal-dashboard.html: {count_portal}")
