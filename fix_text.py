import glob

replacements = {
    'Stabilit\ufffdt': 'Stabilität',
    'L\ufffdsungen': 'Lösungen',
    'z\ufffdhlt': 'zählt',
    'f\ufffdr': 'für',
    'F\ufffdr': 'Für',
    'k\ufffdmpft': 'kämpft',
    '\ufffdber': 'über',
    'Work\ufffd': 'Work®',
    ' \ufffd ': ' – ',
    '\ufffd?"': '–'
}

for file in glob.glob('*.html'):
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for bad, good in replacements.items():
        content = content.replace(bad, good)
        
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
