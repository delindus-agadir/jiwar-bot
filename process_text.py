import re

def process_text(input_file, output_html, output_md):
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Clean lines
    lines = [line.strip() for line in lines if line.strip()]

    structured_content = []
    toc = []
    
    # Heuristics for headings
    # We assume short lines that don't end with typical sentence endings are headings
    # Or specific keywords
    
    current_section_id = 0
    
    html_content = """
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>رحلة الحج إلى الجنان - الفتنة الكبرى</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Aref+Ruqaa&display=swap');
        
        body {
            font-family: 'Amiri', serif;
            line-height: 1.8;
            color: #333;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
        }
        
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: #fff;
            padding: 40px;
            box-shadow: 0 0 20px rgba(0,0,0,0.05);
        }
        
        h1, h2, h3 {
            font-family: 'Aref Ruqaa', serif;
            color: #2c3e50;
            margin-top: 1.5em;
            margin-bottom: 0.5em;
        }
        
        h1 {
            text-align: center;
            font-size: 2.5em;
            color: #1a5276;
            border-bottom: 2px solid #eee;
            padding-bottom: 20px;
        }
        
        h2 {
            font-size: 1.8em;
            border-right: 5px solid #1a5276;
            padding-right: 15px;
            background: #f4f6f7;
            padding: 10px 15px 10px 0;
        }
        
        h3 {
            font-size: 1.4em;
            color: #7f8c8d;
        }
        
        p {
            margin-bottom: 1em;
            text-align: justify;
            font-size: 1.1em;
        }
        
        ul {
            list-style-type: square;
            margin-right: 20px;
        }
        
        .toc {
            background: #eaf2f8;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 40px;
            border: 1px solid #d4e6f1;
        }
        
        .toc h2 {
            margin-top: 0;
            background: none;
            border: none;
            padding: 0;
            font-size: 1.5em;
            text-align: center;
        }
        
        .toc ul {
            list-style: none;
            padding: 0;
        }
        
        .toc li {
            margin-bottom: 8px;
        }
        
        .toc a {
            text-decoration: none;
            color: #2980b9;
            font-weight: bold;
            transition: color 0.3s;
        }
        
        .toc a:hover {
            color: #c0392b;
        }
        
        .footer {
            text-align: center;
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 0.9em;
            color: #7f8c8d;
        }
        
        @media print {
            body { background: #fff; }
            .container { box-shadow: none; padding: 0; }
            .toc { display: none; }
        }
    </style>
</head>
<body>
    <div class="container">
    """

    md_content = "# رحلة الحج إلى الجنان - الفتنة الكبرى\n\n"
    
    # Generate TOC placeholder
    html_body = ""
    
    # Process lines
    # First line is likely title
    if lines:
        title = lines[0]
        html_body += f"<h1>{title}</h1>\n"
        # md_content is already set with a title, but let's respect the file's title if different
        
    
    for i, line in enumerate(lines):
        if i == 0: continue # Skip title as we handled it
        
        # Check if heading
        # Logic: Short line, no ending punctuation (., !, ?), or starts with specific words
        is_heading = False
        if len(line) < 80 and not line.endswith(('.', ':', '!', '؟')):
            is_heading = True
        elif re.match(r'^(الفصل|الباب|مقدمة|خاتمة|المبحث|مطلب)', line):
            is_heading = True
            
        if is_heading:
            current_section_id += 1
            anchor = f"section_{current_section_id}"
            toc.append((anchor, line))
            html_body += f'<h2 id="{anchor}">{line}</h2>\n'
            md_content += f"\n## {line}\n\n"
        else:
            # Check for bullet points
            if line.startswith('•') or line.startswith('-') or line.startswith('*'):
                html_body += f"<ul><li>{line[1:].strip()}</li></ul>\n" # Simple list handling
                md_content += f"- {line[1:].strip()}\n"
            else:
                html_body += f"<p>{line}</p>\n"
                md_content += f"{line}\n\n"

    # Build TOC HTML
    toc_html = '<div class="toc"><h2>فهرس المحتويات</h2><ul>'
    for anchor, title in toc:
        toc_html += f'<li><a href="#{anchor}">{title}</a></li>'
    toc_html += '</ul></div>'
    
    # Assemble final HTML
    final_html = html_content + toc_html + html_body + """
        <div class="footer">
            <p>تم إعداد هذا الملف وتنسيقه آلياً</p>
        </div>
    </div>
</body>
</html>
    """
    
    with open(output_html, 'w', encoding='utf-8') as f:
        f.write(final_html)
        
    with open(output_md, 'w', encoding='utf-8') as f:
        f.write(md_content)

if __name__ == "__main__":
    process_text("extracted_content.txt", "processed_journey.html", "processed_journey.md")
    print("Processing complete.")
