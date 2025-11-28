import re

def generate_toc(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    toc_lines = []
    toc_lines.append("## فهرس المحتويات\n\n")
    
    # Regex to capture headings
    heading_pattern = re.compile(r'^(##+)\s+(.*)')
    
    for line in lines:
        match = heading_pattern.match(line)
        if match:
            level = len(match.group(1))
            title = match.group(2).strip()
            # Create a simple anchor (this might need adjustment based on the specific markdown renderer)
            # For now, we will just list them. If we want links, we need to know the slugification rule.
            # Let's try to create a link assuming GitHub style: lowercase, spaces to hyphens, remove punctuation
            slug = title.lower().replace(' ', '-')
            slug = re.sub(r'[^\w\-]', '', slug) # Remove non-word chars (except hyphens) - might be too aggressive for Arabic
            
            # Actually, for Arabic, it's often safer to just link to the text if the renderer supports it, 
            # or just provide the list. 
            # Let's try to make it a link but keep the text clean.
            # A safer approach for a generic markdown is just the list.
            # But the user wants a "professional" output.
            # Let's try to generate standard markdown links.
            
            indent = '  ' * (level - 2)
            toc_lines.append(f"{indent}- [{title}](#{slug})\n")

    # Insert TOC after the first heading (Title)
    # Assuming the first line is the title "# ..."
    insert_index = 0
    for i, line in enumerate(lines):
        if line.startswith('# '):
            insert_index = i + 1
            break
            
    # Add some spacing
    final_lines = lines[:insert_index] + ['\n'] + toc_lines + ['\n'] + lines[insert_index:]
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(final_lines)

if __name__ == "__main__":
    generate_toc(r"c:\Antigravity\processed_journey.md")
    print("TOC generated and inserted.")
