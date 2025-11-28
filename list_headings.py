def list_headings(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    for i, line in enumerate(lines):
        if i < 100: continue
        if line.strip().startswith('##'):
            print(f"Line {i+1}: {line.strip()}")

if __name__ == "__main__":
    list_headings(r"c:\Antigravity\processed_journey.md")
