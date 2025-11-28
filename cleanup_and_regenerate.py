import re
import os

def cleanup_and_regenerate(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # 1. Truncate at "## دليل الكتاب"
    # We found it at line 1114 (1-based), so index 1113.
    # But let's find it dynamically to be safe.
    cutoff_index = -1
    for i, line in enumerate(lines):
        if i < 100: continue
        if 'دليل الكتاب' in line and line.strip().startswith('##'):
            cutoff_index = i
            break
    
    if cutoff_index != -1:
        lines = lines[:cutoff_index]
        print(f"Truncated file at line {cutoff_index+1}")
    else:
        print("Could not find cutoff point 'دليل الكتاب'")

    # 2. Fix bullet heading
    # We found it at line 235 (1-based), index 234.
    # Again, find dynamically.
    for i, line in enumerate(lines):
        if i < 100: continue
        if '•' in line and line.strip().startswith('##'):
            lines[i] = line.replace('## ', '', 1)
            print(f"Fixed bullet heading at line {i+1}")
            
    # 3. Remove existing TOC if present (to avoid duplication when regenerating)
    # The existing TOC starts at line 3 "## فهرس المحتويات" and ends before the first real heading.
    # Or we can just overwrite the whole file content with the new content + new TOC.
    # But generate_toc.py inserts TOC.
    # So we should remove the OLD TOC first.
    
    # Find start of TOC
    toc_start = -1
    for i, line in enumerate(lines):
        if '## فهرس المحتويات' in line:
            toc_start = i
            break
            
    # Find end of TOC (next heading)
    toc_end = -1
    if toc_start != -1:
        for i in range(toc_start + 1, len(lines)):
            if line.strip().startswith('##') and 'فهرس المحتويات' not in lines[i]:
                # Wait, the TOC itself contains links which might look like headings if not careful?
                # No, TOC lines start with "-".
                # The next section starts with "##".
                if lines[i].startswith('## '):
                    toc_end = i
                    break
        
        if toc_end == -1:
             # Maybe TOC goes until end of file? Unlikely.
             pass
        else:
             # Remove TOC lines
             print(f"Removing old TOC from {toc_start+1} to {toc_end}")
             del lines[toc_start:toc_end]

    # Save cleaned content
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)
        
    # 4. Regenerate TOC
    # We can just call the logic here instead of running the other script.
    
    toc_lines = []
    toc_lines.append("## فهرس المحتويات\n\n")
    
    heading_pattern = re.compile(r'^(##+)\s+(.*)')
    
    # Re-read lines from memory (they are already cleaned)
    # But we need to find where to insert.
    # The first line is title.
    
    for line in lines:
        match = heading_pattern.match(line)
        if match:
            level = len(match.group(1))
            title = match.group(2).strip()
            # Skip the TOC heading itself if we accidentally added it (we shouldn't have)
            if "فهرس المحتويات" in title: continue
            
            slug = title.lower().replace(' ', '-')
            slug = re.sub(r'[^\w\-]', '', slug)
            
            indent = '  ' * (level - 2)
            toc_lines.append(f"{indent}- [{title}](#{slug})\n")

    # Insert TOC after title
    insert_index = 0
    for i, line in enumerate(lines):
        if line.startswith('# '):
            insert_index = i + 1
            break
            
    final_lines = lines[:insert_index] + ['\n'] + toc_lines + ['\n'] + lines[insert_index:]
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(final_lines)
        
    print("Cleanup and regeneration complete.")

if __name__ == "__main__":
    cleanup_and_regenerate(r"c:\Antigravity\processed_journey.md")
