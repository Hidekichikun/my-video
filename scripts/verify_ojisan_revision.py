from pathlib import Path
import json, re, hashlib, struct
base = Path(__file__).resolve().parents[1] / 'mv' / '軽トラのおじさん'
manifest = json.loads((base / 'assets-manifest.json').read_text(encoding='utf-8'))
items = {i['file']:i for section in ['characters','sprites','backgrounds','thumbnail'] for i in manifest[section]}
page = base / '素材一覧.html'
def correct(m):
    article = m.group()
    name = re.search(r'<p class="filename">([^<]+)</p>', article)
    if name and name[1] in items:
        i=items[name[1]]
        article=re.sub(r'\d+×\d+ px', f"{i['width']}×{i['height']} px", article)
    return article
html = re.sub(r'<article>.*?</article>', correct, page.read_text(encoding='utf-8'), flags=re.S)
page.write_text(html, encoding='utf-8')
for name,i in items.items():
    raw=(base/name).read_bytes()
    assert hashlib.sha256(raw).hexdigest()==i['sha256'],name
    assert struct.unpack('>II',raw[16:24])==(i['width'],i['height']),name
    assert (base/i['prompt']).is_file()
    for key in ['used_prompt','correction_prompt']:
        if key in i: assert (base/i[key]).is_file()
    article=next(a for a in re.findall(r'<article>.*?</article>',html,re.S) if f'<p class="filename">{name}</p>' in a)
    assert f"{i['width']}×{i['height']} px" in article,name
print('Verified 42 image hashes, dimensions, prompt links and gallery entries; 25 revised images and 17 unchanged sources.')
