import zipfile
import xml.etree.ElementTree as ET
import sys
import os

def extract_text_from_docx(docx_path):
    try:
        with zipfile.ZipFile(docx_path) as zf:
            xml_content = zf.read('word/document.xml')
        
        tree = ET.fromstring(xml_content)
        
        # Namespaces in docx XML
        namespaces = {
            'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
        }
        
        text_parts = []
        for p in tree.findall('.//w:p', namespaces):
            paragraph_text = []
            for t in p.findall('.//w:t', namespaces):
                if t.text:
                    paragraph_text.append(t.text)
            if paragraph_text:
                text_parts.append(''.join(paragraph_text))
        
        return '\n'.join(text_parts)
    except Exception as e:
        return f"Error: {str(e)}"

if __name__ == "__main__":
    filename = "رحلة الحج إلى الجنان.docx"
    if not os.path.exists(filename):
        print(f"File not found: {filename}")
        sys.exit(1)
        
    content = extract_text_from_docx(filename)
    
    # Write to a text file to be read by the agent
    with open("extracted_content.txt", "w", encoding="utf-8") as f:
        f.write(content)
    
    print("Extraction complete. Content saved to extracted_content.txt")
