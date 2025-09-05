from flask import Flask, request, redirect, render_template_string
import json, os, webbrowser, shutil
from threading import Timer
from werkzeug.utils import secure_filename

app = Flask(__name__)
DATA_FILE = 'recipes.json'
VIEWER_JSON = 'viewer/recipes.json'
UPLOAD_FOLDER = 'images'
VIEWER_IMAGE_FOLDER = os.path.join('viewer', 'images')
NO_IMAGE = 'NO_IMAGE.jpg'
VIEWER_HTML_PATH = '/viewer/index.html'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# フォルダ準備
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs('viewer', exist_ok=True)
os.makedirs(VIEWER_IMAGE_FOLDER, exist_ok=True)

# JSON読み込み
def load_recipes():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

# JSON保存（2箇所）
def save_recipes(recipes):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(recipes, f, ensure_ascii=False, indent=2)
    with open(VIEWER_JSON, 'w', encoding='utf-8') as f:
        json.dump(recipes, f, ensure_ascii=False, indent=2)

# 画像フォルダを viewer/images にコピー
def copy_images():
    for filename in os.listdir(UPLOAD_FOLDER):
        src = os.path.join(UPLOAD_FOLDER, filename)
        dst = os.path.join(VIEWER_IMAGE_FOLDER, filename)
        if os.path.isfile(src):
            shutil.copy2(src, dst)

form_html = """
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>レシピ追加</title>
  <style>
    body { font-family: sans-serif; padding: 2em; background: #fffbe6; }
    form { max-width: 500px; margin: auto; background: #fff; padding: 1em; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
    input, textarea { width: 100%; margin-bottom: 1em; padding: 0.5em; }
    .ingredient-row { display: flex; align-items: center; margin-bottom: 0.5em; }
    .ingredient-row .autocomplete-container { flex: 1; position: relative; margin-right: 0.5em; }
    .ingredient-row input { margin-bottom: 0; width: 100%; }
    .autocomplete-list { position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #ddd; border-top: none; max-height: 200px; overflow-y: auto; z-index: 1000; display: none; }
    .autocomplete-item { padding: 0.5em; cursor: pointer; border-bottom: 1px solid #eee; }
    .autocomplete-item:hover, .autocomplete-item.selected { background: #f0f0f0; }
    #drop-area { border: 2px dashed #ccc; padding: 1em; text-align: center; margin-bottom: 1em; cursor: pointer; }
    button { padding: 0.5em 1em; background: #ffb347; border: none; color: white; cursor: pointer; }
    .message { color: green; text-align: center; margin-bottom: 1em; }
    .error { color: red; text-align: center; margin-bottom: 1em; }
  </style>
</head>
<body>
  <h1>レシピ追加</h1>
  {% if message %}
    <div class="message">{{ message }}</div>
  {% endif %}
  {% if error %}
    <div class="error">{{ error }}</div>
  {% endif %}
  <form method="POST" enctype="multipart/form-data">
    <label>料理名</label>
    <input type="text" name="name" required>

    <label>材料</label>
    <div id="ingredients-container">
      <div class="ingredient-row">
        <div class="autocomplete-container">
          <input type="text" name="ingredients[]" placeholder="材料を入力" required class="ingredient-input" autocomplete="off">
          <div class="autocomplete-list"></div>
        </div>
        <button type="button" onclick="removeIngredient(this)" style="background:#d33;color:white;border:none;padding:0.3em;margin-left:0.5em;">削除</button>
      </div>
    </div>
    <button type="button" onclick="addIngredient()" style="background:#4CAF50;color:white;border:none;padding:0.5em;margin-bottom:1em;">材料を追加</button>

<br>

    <label>説明</label>
    <textarea name="description" rows="4" required></textarea>

    <label>画像（ドラッグ＆ドロップ可）</label>
    <div id="drop-area">ここに画像をドロップ</div>
    <input type="file" name="photo" id="file-input" hidden>

    <button type="submit">追加する</button>
  </form>

  <div style="margin-top:2em;text-align:center;">
    <a href="/view" style="display:inline-block;padding:0.5em 1em;background:#4CAF50;color:white;text-decoration:none;border-radius:4px;margin:0.5em;">レシピ一覧を見る</a>
    <form action="/shutdown" method="GET" style="display:inline-block;margin:0.5em;">
      <button type="submit" style="background:#d33;">サーバー停止</button>
    </form>
  </div>

  <script>
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');

    dropArea.addEventListener('dragover', e => {
      e.preventDefault();
      dropArea.style.background = '#ffe';
    });

    dropArea.addEventListener('drop', e => {
      e.preventDefault();
      fileInput.files = e.dataTransfer.files;
      dropArea.textContent = fileInput.files[0].name;
      dropArea.style.background = '#fff';
    });

    dropArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
      dropArea.textContent = fileInput.files[0].name;
    });

    // 材料データを格納
    let allIngredients = [];
    
    // 材料データを読み込み
    fetch('/api/ingredients')
    .then(response => response.json())
    .then(data => {
      allIngredients = data;
      setupAutocomplete();
    })
    .catch(error => console.error('材料データの読み込みに失敗:', error));

    // 材料の動的追加・削除機能
    function addIngredient() {
      const container = document.getElementById('ingredients-container');
      const newRow = document.createElement('div');
      newRow.className = 'ingredient-row';
      newRow.innerHTML = `
        <div class="autocomplete-container">
          <input type="text" name="ingredients[]" placeholder="材料を入力" required class="ingredient-input" autocomplete="off">
          <div class="autocomplete-list"></div>
        </div>
        <button type="button" onclick="removeIngredient(this)" style="background:#d33;color:white;border:none;padding:0.3em;margin-left:0.5em;">削除</button>
      `;
      container.appendChild(newRow);
      setupAutocompleteForInput(newRow.querySelector('.ingredient-input'));
    }

    function removeIngredient(button) {
      const container = document.getElementById('ingredients-container');
      if (container.children.length > 1) {
        button.parentElement.remove();
      } else {
        alert('最低1つの材料は必要です');
      }
    }

    // オートコンプリート機能のセットアップ
    function setupAutocomplete() {
      const inputs = document.querySelectorAll('.ingredient-input');
      inputs.forEach(input => setupAutocompleteForInput(input));
    }

    function setupAutocompleteForInput(input) {
      const autocompleteList = input.nextElementSibling;
      let selectedIndex = -1;

      input.addEventListener('input', function() {
        const value = this.value.toLowerCase();
        autocompleteList.innerHTML = '';
        selectedIndex = -1;

        if (value.length === 0) {
          autocompleteList.style.display = 'none';
          return;
        }

        const matches = allIngredients.filter(ingredient => 
          ingredient.toLowerCase().includes(value)
        ).slice(0, 8); // 最大8個まで表示

        if (matches.length > 0) {
          matches.forEach((match, index) => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            item.textContent = match;
            item.addEventListener('click', function() {
              input.value = match;
              autocompleteList.style.display = 'none';
            });
            autocompleteList.appendChild(item);
          });
          autocompleteList.style.display = 'block';
        } else {
          autocompleteList.style.display = 'none';
        }
      });

      input.addEventListener('keydown', function(e) {
        const items = autocompleteList.querySelectorAll('.autocomplete-item');
        if (items.length === 0) return;

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          selectedIndex = (selectedIndex + 1) % items.length;
          updateSelection(items);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          selectedIndex = selectedIndex <= 0 ? items.length - 1 : selectedIndex - 1;
          updateSelection(items);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (selectedIndex >= 0) {
            input.value = items[selectedIndex].textContent;
            autocompleteList.style.display = 'none';
          }
        } else if (e.key === 'Escape') {
          autocompleteList.style.display = 'none';
        }
      });

      input.addEventListener('blur', function() {
        // 少し遅延してリストを閉じる（クリック処理を先に実行するため）
        setTimeout(() => {
          autocompleteList.style.display = 'none';
        }, 200);
      });

      function updateSelection(items) {
        items.forEach((item, index) => {
          if (index === selectedIndex) {
            item.classList.add('selected');
          } else {
            item.classList.remove('selected');
          }
        });
      }
    }
  </script>
</body>
</html>
"""

@app.route('/', methods=['GET', 'POST'])
def add_recipe():
    if request.method == 'POST':
        name = request.form.get("name", "").strip()
        ingredients_list = request.form.getlist("ingredients[]")
        ingredients = [i.strip() for i in ingredients_list if i.strip()]
        description = request.form.get("description", "").strip()

        if not name or not ingredients or not description:
            return render_template_string(form_html, error="すべての項目を入力してください")

        recipes = load_recipes()
        new_id = f"recipe{len(recipes) + 1}"

        photo_file = request.files.get("photo")
        if photo_file and photo_file.filename:
            filename = secure_filename(f"{new_id}_{photo_file.filename}")
            photo_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            photo_file.save(photo_path)
        else:
            filename = NO_IMAGE

        new_recipe = {
            "id": new_id,
            "name": name,
            "ingredients": ingredients,
            "description": description,
            "photo": f"images/{filename}"
        }

        recipes.append(new_recipe)
        save_recipes(recipes)
        copy_images()
        return render_template_string(form_html, message="レシピを追加しました")
    return render_template_string(form_html)

@app.route('/view')
def view_recipes():
    with open('index.html', 'r', encoding='utf-8') as f:
        return f.read()

@app.route('/recipes.json')
def get_recipes():
    return load_recipes()

@app.route('/style.css')
def get_style():
    with open('style.css', 'r', encoding='utf-8') as f:
        return f.read(), 200, {'Content-Type': 'text/css'}

@app.route('/script.js')
def get_script():
    with open('script.js', 'r', encoding='utf-8') as f:
        return f.read(), 200, {'Content-Type': 'application/javascript'}

@app.route('/images/<filename>')
def get_image(filename):
    from flask import send_from_directory
    return send_from_directory('images', filename)

@app.route('/api/ingredients')
def get_all_ingredients():
    """既存レシピから全材料のリストを取得"""
    recipes = load_recipes()
    all_ingredients = set()
    for recipe in recipes:
        for ingredient in recipe['ingredients']:
            all_ingredients.add(ingredient)
    return sorted(list(all_ingredients))

@app.route('/shutdown')
def shutdown():
    func = request.environ.get('werkzeug.server.shutdown')
    if func:
        func()
    return "サーバー停止しました"

def open_browser():
    webbrowser.open("http://localhost:5000")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
