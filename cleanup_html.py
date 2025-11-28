import re

def cleanup_html(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Fix Typo and Table
    # Target string to replace
    target_start = 'عَدَدE جَيْشِ المُنَافِقِينَ'
    # We need to find where this block ends. It ends before "وَصِيَّةُ سَيِّدِنَا وَمَوْلَانَا عَلِيٍّ"
    # or just replace the specific block of headings.
    
    # Let's construct the replacement HTML for the table
    table_html = """<p>عَدَدُ جَيْشِ المُنَافِقِينَ (النَّهْرَوَانِ) كَانَ مِائَةَ أَلْفِ مُقَاتِلٍ (100.000)، مِنْهُمْ ثَلَاثُونَ أَلْفَ فَارِسٍ (30.000). وَعَدَدُ رِجَالِ الإِمَامِ عَلِيٍّ كَرَّمَ اللهُ وَجْهَهُ كَانَ خَمْسَةَ عَشَرَ أَلْفَ رَجُلٍ (15.000)، مِنْهُمْ أَلْفَا فَارِسٍ (2.000).</p>
<p>وَكَانَ تَوْزِيعُ الأَبْنَاءِ الأَبْطَالِ فِي الجَيْشِ كَمَا يَلِي:</p>
<table border="1" style="width:100%; border-collapse: collapse; margin: 20px 0;">
<thead>
<tr style="background-color: #f2f2f2;">
<th style="padding: 10px; border: 1px solid #ddd;">المَوْضِعُ فِي الجَيْشِ</th>
<th style="padding: 10px; border: 1px solid #ddd;">القَائِدُ</th>
<th style="padding: 10px; border: 1px solid #ddd;">مَضى مِنْ عُمُرِه الشَّرِيفِ</th>
<th style="padding: 10px; border: 1px solid #ddd;">الدَّوْرُ</th>
</tr>
</thead>
<tbody>
<tr>
<td style="padding: 10px; border: 1px solid #ddd;">المُقَدِّمَةُ</td>
<td style="padding: 10px; border: 1px solid #ddd;">سَيِّدِي مُحَمَّدُ بْنُ عَلِيٍّ كَرَّمَ اللهُ وَجْهَهُ</td>
<td style="padding: 10px; border: 1px solid #ddd;">اِثْنَانِ وَعِشْرُونَ عَامًا</td>
<td style="padding: 10px; border: 1px solid #ddd;">المِقْدَامُ الشُّجَاعُ</td>
</tr>
<tr>
<td style="padding: 10px; border: 1px solid #ddd;">المَيْمَنَةُ</td>
<td style="padding: 10px; border: 1px solid #ddd;">سَيِّدُنَا الحُسَيْنُ عَلَيْهِ السَّلَامُ</td>
<td style="padding: 10px; border: 1px solid #ddd;">تِسْعٌ وَعِشْرُونَ عَامًا</td>
<td style="padding: 10px; border: 1px solid #ddd;">البَطَلُ الَّذِي لَا يُقْهَرُ</td>
</tr>
<tr>
<td style="padding: 10px; border: 1px solid #ddd;">قَلْبُ الجَيْشِ</td>
<td style="padding: 10px; border: 1px solid #ddd;">الإِمَامُ عَلِيٌّ كَرَّمَ اللهُ وَجْهَهُ</td>
<td style="padding: 10px; border: 1px solid #ddd;">وَاحِدٌ وَسِتُّونَ عَامًا</td>
<td style="padding: 10px; border: 1px solid #ddd;">الإِمَامُ القَائِدُ</td>
</tr>
<tr>
<td style="padding: 10px; border: 1px solid #ddd;">المَيْسَرَةُ</td>
<td style="padding: 10px; border: 1px solid #ddd;">سَيِّدِي الحَسَنُ عَلَيْهِ السَّلَامُ</td>
<td style="padding: 10px; border: 1px solid #ddd;">ثَلَاثُونَ عَامًا</td>
<td style="padding: 10px; border: 1px solid #ddd;">شَبِيهٌ بِسَيِّدِي عَلِيٍّ فِي القِتَالِ</td>
</tr>
<tr>
<td style="padding: 10px; border: 1px solid #ddd;">المُؤَخِّرَةُ</td>
<td style="padding: 10px; border: 1px solid #ddd;">سَيِّدِي مُسْلِمُ بْنُ عَلِيٍّ كَرَّمَ اللهُ وَجْهَهُ</td>
<td style="padding: 10px; border: 1px solid #ddd;">سَبْعَةَ عَشَرَ عَامًا</td>
<td style="padding: 10px; border: 1px solid #ddd;">الغُلَامُ القَوِيُّ بَطَلُ يَوْمِ رِحَابِ الشُّرَفَاءِ</td>
</tr>
</tbody>
</table>"""

    # Regex to replace the block
    # It starts with <p>عَدَدE ... and ends with <h2 ...>الغُلَامُ القَوِيُّ ...</h2>
    # We need to be careful with regex.
    # Let's find the start and end indices.
    
    start_idx = content.find('<p>عَدَدE')
    if start_idx == -1:
        print("Could not find typo start")
        return

    # Find the end of the table section. The last heading was "الغُلَامُ القَوِيُّ بَطَلُ يَوْمِ رِحَابِ الشُّرَفَاءِ"
    end_marker = 'الغُلَامُ القَوِيُّ بَطَلُ يَوْمِ رِحَابِ الشُّرَفَاءِ</h2>'
    end_idx = content.find(end_marker)
    if end_idx == -1:
        print("Could not find table end")
        return
    
    end_idx += len(end_marker)
    
    # Perform replacement
    content = content[:start_idx] + table_html + content[end_idx:]
    print("Fixed typo and table.")

    # 2. Remove Index Section from Body
    # Starts with <h2 id="section_165">دليل الكتاب المكمل
    # Ends before <div class="footer">
    
    index_start_marker = 'دليل الكتاب المكمل'
    # Find the h2 containing this
    index_start_match = re.search(r'<h2 id="[^"]+">' + index_start_marker, content)
    
    if index_start_match:
        index_start_idx = index_start_match.start()
        
        footer_start = content.find('<div class="footer">')
        if footer_start != -1:
            content = content[:index_start_idx] + content[footer_start:]
            print("Removed index section from body.")
        else:
            print("Could not find footer")
    else:
        print("Could not find index section start")

    # 3. Clean up TOC
    # The TOC is in <div class="toc">...</div>
    # We need to remove <li><a href="#section_165">...</a></li> and subsequent ones until the end of the list.
    # Or simpler: remove any <li> that contains text matching the removed sections.
    # But we don't know exactly which sections were removed without parsing.
    # However, we know the index started at section_165 (based on the view_file output).
    # So we can remove any link to section_165 and greater.
    
    # Regex to find TOC entries
    # <a href="#section_(\d+)">
    
    def replace_toc(match):
        toc_content = match.group(1)
        # We want to filter out lis with section_id >= 165
        # Regex for <li><a href="#section_(\d+)">.*?</a></li>
        
        def filter_li(li_match):
            sec_id = int(li_match.group(1))
            if sec_id >= 165:
                return ''
            return li_match.group(0)
            
        new_toc_content = re.sub(r'<li><a href="#section_(\d+)">.*?</a></li>', filter_li, toc_content)
        return '<div class="toc"><h2>فهرس المحتويات</h2><ul>' + new_toc_content + '</ul></div>'

    content = re.sub(r'<div class="toc"><h2>فهرس المحتويات</h2><ul>(.*?)</ul></div>', replace_toc, content, flags=re.DOTALL)
    print("Cleaned TOC.")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == "__main__":
    cleanup_html(r"c:\Antigravity\processed_journey.html")
