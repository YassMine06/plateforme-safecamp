import os
import re

TARGET_DIR = r"d:\YASSMINE\Cycle\S2\Langues\SafeCampus\website 4 claude\frontend\src"
BUMP = -3  # Revert the +3 bump

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    def repl_inline(m):
        val = int(m.group(1)) + BUMP
        return f"fontSize:{val}"
    
    content = re.sub(r'fontSize\s*:\s*(\d+)', repl_inline, content)

    def repl_attr_brace(m):
        val = int(m.group(1)) + BUMP
        return f"fontSize={{{val}}}"
        
    content = re.sub(r'fontSize=\{\s*(\d+)\s*\}', repl_attr_brace, content)

    # We also bumped index.css font-size: Xpx in the previous script. Let's revert that too if exists.
    if filepath.endswith('.css'):
        def repl_css(m):
            val = int(m.group(1)) + BUMP
            return f"font-size: {val}px"
        content = re.sub(r'font-size\s*:\s*(\d+)px', repl_css, content)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Reverted: {filepath}")

for root, dirs, files in os.walk(TARGET_DIR):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.css'):
            process_file(os.path.join(root, file))

print("Done font revert.")
