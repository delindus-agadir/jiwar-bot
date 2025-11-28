def find_lines(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    for i, line in enumerate(lines):
        if 'دليل الكتاب' in line:
            print(f"Found 'دليل الكتاب' at line {i+1}: {line.strip()}")
        if line.strip().startswith('##') and '•' in line:
            print(f"Found bullet heading at line {i+1}: {line.strip()}")

if __name__ == "__main__":
    find_lines(r"c:\Antigravity\processed_journey.md")
