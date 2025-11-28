def find_index_start(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    for i, line in enumerate(lines):
        if i < 100: continue # Skip TOC
        if 'دليل الكتاب' in line and line.strip().startswith('##'):
             print(f"Found 'دليل الكتاب' at line {i+1}")
             return
        if 'الفتنة الكبرى1' in line and line.strip().startswith('##'):
             print(f"Found 'الفتنة الكبرى1' at line {i+1}")
             return

if __name__ == "__main__":
    find_index_start(r"c:\Antigravity\processed_journey.md")
