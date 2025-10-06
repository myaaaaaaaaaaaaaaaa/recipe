import re
import os
from pathlib import Path

# --- 設定 ---
# 変更対象のHTMLファイルがあるディレクトリを指定してください
# スクリプトと同じディレクトリにある場合は「.」
# 例: C:\\Users\\user\\Documents\\recipe_files
TARGET_DIR = "." 

# HTMLファイルの拡張子
FILE_EXTENSION = "*.html"
# -----------------

def convert_recipe_table(html_content: str) -> str:
    """
    HTMLコンテンツ内のレシピテーブル構造を変更する関数。
    
    元の構造:
    <table>...<thead><th>材料</th><th>作り方</th></thead>
    <tbody><tr><td>材料A</td><td>手順1</td></tr><tr><td>材料B</td><td>手順2</td></tr>...</tbody>
    </table>
    
    変更後の構造:
    <table>
    <tbody><tr><th>材料</th></tr><tr><td>材料A</td></tr><tr><td>材料B</td></tr>...</tbody>
    <tbody><tr><th>作り方</th></tr><tr><td>手順1</td></tr><tr><td>手順2</td></tr>...</tbody>
    </table>
    """
    
    # 1. tbodyの中身（<tr>...</tr>の集合）を抽出する正規表現
    # <tbody の開始タグから </tbody> の終了タグまでをキャプチャ
    tbody_pattern = re.compile(r'<tbody\s*>(.*?)</tbody\s*>', re.DOTALL)
    tbody_match = tbody_pattern.search(html_content)
    
    if not tbody_match:
        # tbody が見つからなければ変更をスキップ
        return html_content

    tbody_content = tbody_match.group(1)
    
    # 2. 各行<tr>を抽出する正規表現
    # <tr><td...>...</td><td...>...</td></tr>
    # <td>1列目</td>と<td>2列目</td>の内容をそれぞれキャプチャ
    row_pattern = re.compile(
        r'<tr[^>]*>\s*<td[^>]*>(.*?)</td>\s*<td[^>]*>(.*?)</td>\s*</tr>', 
        re.DOTALL | re.IGNORECASE
    )
    
    materials_rows = []
    instructions_rows = []

    # 3. 抽出した行の内容を「材料」と「作り方」に分離
    for match in row_pattern.finditer(tbody_content):
        material = match.group(1).strip()
        instruction = match.group(2).strip()
        
        # 材料の行を作成
        if material:
            materials_rows.append(f"<tr><td>{material}</td></tr>")
        
        # 作り方の行を作成
        if instruction:
            instructions_rows.append(f"<tr><td>{instruction}</td></tr>")

    # 4. 新しい tbody の内容を組み立て
    new_materials_tbody = ""
    if materials_rows:
        # 材料の見出しと内容を結合
        new_materials_tbody = (
            f"\n<tbody>\n\t<tr><th>材料</th></tr>\n\t"
            f"{'\n\t'.join(materials_rows)}\n"
            f"</tbody>"
        )

    new_instructions_tbody = ""
    if instructions_rows:
        # 作り方の見出しと内容を結合
        new_instructions_tbody = (
            f"\n<tbody>\n\t<tr><th>作り方</th></tr>\n\t"
            f"{'\n\t'.join(instructions_rows)}\n"
            f"</tbody>"
        )

    # 5. <table>の新しい中身（<thead>を削除し、新しい<tbody>を挿入）
    new_table_content = f"{new_materials_tbody}{new_instructions_tbody}\n"

    # 6. HTML全体を更新する正規表現の置換パターンを構築
    # <table...から</table>まで全体をキャプチャし、その中身だけを置換する
    # <thead>と既存の<tbody>を削除し、新しい中身に置き換える
    table_pattern = re.compile(
        r'(<table\s*class="recipe-table"[^>]*>)\s*<thead>.*?</thead>\s*<tbody>.*?</tbody>\s*(</table>)', 
        re.DOTALL | re.IGNORECASE
    )
    
    # 7. 最終的な置換処理
    def replace_func(match):
        # <table>の開始タグと終了タグを維持し、中身を新しい構造に置き換え
        return f"{match.group(1)}{new_table_content}{match.group(2)}"

    modified_html = table_pattern.sub(replace_func, html_content)

    return modified_html


def process_files():
    """指定されたディレクトリ内のHTMLファイルを処理し、上書きする"""
    target_path = Path(TARGET_DIR)
    
    if not target_path.exists():
        print(f"エラー: 指定されたディレクトリが存在しません: {TARGET_DIR}")
        return

    print(f"--- 処理を開始します。対象ディレクトリ: {target_path.resolve()} ---")
    
    processed_count = 0
    
    # 指定された拡張子のファイルをすべて検索
    for file_path in target_path.glob(FILE_EXTENSION):
        if not file_path.is_file():
            continue

        print(f"ファイルを処理中: {file_path.name}")
        
        try:
            # ファイルを読み込み (文字コードはUTF-8を想定)
            original_content = file_path.read_text(encoding='utf-8')
            
            # HTML構造を変換
            modified_content = convert_recipe_table(original_content)
            
            # 変更があった場合のみ上書き
            if original_content != modified_content:
                file_path.write_text(modified_content, encoding='utf-8')
                processed_count += 1
                print(f"  -> 変更を保存しました。")
            else:
                print(f"  -> 変更なし。")
                
        except Exception as e:
            print(f"エラーが発生しました ({file_path.name}): {e}")

    print(f"--- 処理が完了しました。計 {processed_count} 個のファイルを更新しました。 ---")

if __name__ == "__main__":
    process_files()