from bs4 import BeautifulSoup
from janome.tokenizer import Tokenizer
from collections import defaultdict
import re

# HTML読み込み
with open('index.html', encoding='utf-8') as f:
    soup = BeautifulSoup(f, 'html.parser')

tokenizer = Tokenizer()

# 読み仮名で材料をグループ化（画像ID付き）
reading_map = defaultdict(lambda: defaultdict(set))

# 各レシピ行（tr）を処理
for row in soup.select('tr'):
    # 画像IDを取得（例: images/001.jpg → 001）
    img_tag = row.select_one('img')
    if not img_tag or 'src' not in img_tag.attrs:
        continue
    match = re.search(r'images/(\d+)\.jpg', img_tag['src'])
    if not match:
        continue
    recipe_id = match.group(1)

    # 材料抽出
    for span in row.select('span.material'):
        text = span.get_text(strip=True)
        name = text.split(':')[0].strip()

        tokens = tokenizer.tokenize(name)
        readings = [t.reading if t.reading != '*' else t.surface for t in tokens]
        reading = ''.join(readings)

        reading_map[reading][name].add(recipe_id)

# 表記ゆれのある読み仮名を抽出
print('🔍 表記ゆれのある材料とその画像ID:')
for reading, variants in reading_map.items():
    if len(variants) > 1:
        print(f'読み: {reading}')
        for form, ids in variants.items():
            print(f'  - 表記: {form} → 使用レシピID: {", ".join(sorted(ids))}')
