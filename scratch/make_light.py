import re

with open('portal-dashboard.html', 'r', encoding='utf-8') as f:
    content = f.read()

# HTML dark class
content = content.replace('<html lang="de" class="dark">', '<html lang="de">')

# Custom CSS
replacements = {
    'background-color: #121212;': 'background-color: #f8fafc;',
    'color: #ffffff;': 'color: #0f172a;',
    'background-color: #18181b;': 'background-color: #ffffff;',
    'border-right: 1px solid #27272a;': 'border-right: 1px solid #e2e8f0;',
    'color: #a1a1aa;': 'color: #64748b;',
    'background-color: #27272a;': 'background-color: #f1f5f9;',
    'border: 1px solid #27272a;': 'border: 1px solid #e2e8f0;',
    'background: linear-gradient(135deg, #134e4a 0%, #18181b 100%);': 'background: linear-gradient(135deg, #f0fdfa 0%, #ffffff 100%);',
    'border: 1px solid #2dd4bf33;': 'border: 1px solid #ccfbf1;',
    'stroke="#27272a"': 'stroke="#e2e8f0"',
}

for k, v in replacements.items():
    content = content.replace(k, v)

# JS fix
content = content.replace(
    "document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active', 'bg-zinc-800', 'text-white'));",
    "document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active', 'bg-zinc-800', 'text-white', 'bg-slate-100', 'text-slate-900'));"
)
content = content.replace(
    "this.classList.add('active', 'bg-zinc-800', 'text-white');",
    "this.classList.add('active');"
)

# Tailwind classes
tw_replacements = {
    r'\btext-white\b': 'text-slate-900',
    r'\btext-zinc-100\b': 'text-slate-900',
    r'\btext-zinc-200\b': 'text-slate-800',
    r'\btext-zinc-300\b': 'text-slate-700',
    r'\btext-zinc-400\b': 'text-slate-500',
    r'\btext-zinc-500\b': 'text-slate-500',
    r'\btext-zinc-600\b': 'text-slate-400',
    r'\bbg-zinc-900\b': 'bg-white',
    r'\bbg-zinc-800/50\b': 'bg-slate-50',
    r'\bbg-zinc-800\b': 'bg-white',
    r'\bborder-zinc-800/50\b': 'border-slate-100',
    r'\bborder-zinc-800\b': 'border-slate-200',
    r'\bborder-zinc-700\b': 'border-slate-200',
    r'\bborder-zinc-600\b': 'border-slate-200',
}

# Need to protect specific text-white elements:
# <span class="... bg-red-500 text-white ...">
# <div class="w-3 h-3 bg-white rounded-full">
# <button ... text-white ...">
# So let's temporarily mask them.

content = content.replace('bg-red-500 text-white', 'bg-red-500 TEXT_WHITE_MASK')
content = content.replace('bg-white rounded-full', 'BG_WHITE_MASK rounded-full')
content = content.replace('text-white font-medium', 'TEXT_WHITE_MASK font-medium')
# In JS, we had text-white but we removed it.

for pat, repl in tw_replacements.items():
    content = re.sub(pat, repl, content)

# Unmask
content = content.replace('TEXT_WHITE_MASK', 'text-white')
content = content.replace('BG_WHITE_MASK', 'bg-white')

with open('portal-dashboard.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
