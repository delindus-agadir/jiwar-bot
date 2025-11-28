def find_bullet_heading(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    for i, line in enumerate(lines):
        if i < 100: continue # Skip TOC
        if '•' in line and line.strip().startswith('##'):
             print(f"Found bullet heading at line {i+1}: {line.strip()}")

if __name__ == "__main__":
    find_bullet_heading(r"c:\Antigravity\processed_journey.md")
