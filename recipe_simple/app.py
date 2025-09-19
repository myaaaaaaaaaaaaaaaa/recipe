from flask import Flask, render_template, request, jsonify
from bs4 import BeautifulSoup
import os
import webbrowser
import threading

app = Flask(__name__)
recipes = {}

def load_recipes():
    with open("index.html", encoding="utf-8") as f:
        soup = BeautifulSoup(f, "html.parser")
    for tr in soup.select("tr[data-id]"):
        id = tr["data-id"]

        name_tag = tr.select_one(".recipe-name a")
        name = name_tag.get_text(strip=True) if name_tag else ""

        reading_tag = tr.select_one(".recipe-name .hidden-reading")
        reading = reading_tag.get_text(strip=True) if reading_tag else ""

        genre_td = tr.select("td")[3]
        genre = genre_td.get_text(strip=True) if genre_td else ""

        materials = [m.get_text(strip=True) for m in tr.select(".material") if m.get_text(strip=True)]

        img_tag = tr.select_one("img")
        image = os.path.basename(img_tag["src"]) if img_tag and "src" in img_tag.attrs else ""

        recipes[id] = {
            "id": id,
            "name": name,
            "reading": reading,
            "genre": genre,
            "materials": materials,
            "image": image
        }

load_recipes()

@app.route("/create")
def create():
    return render_template("form.html", ids=sorted(recipes.keys()))

@app.route("/api/recipe/<id>")
def get_recipe(id):
    return jsonify(recipes.get(id, {}))

@app.route("/api/generated/<cookpad_id>")
def get_generated_recipe(cookpad_id):
    # IDを3桁ゼロ埋め（例: "1" → "001"）
    cookpad_id = cookpad_id.zfill(3)

    path = os.path.join("output", f"recipe_{cookpad_id}.html")
    print("参照中のファイル:", path)  # ✅ デバッグ出力

    if not os.path.exists(path):
        print("ファイルが存在しません")
        return jsonify({})

    with open(path, encoding="utf-8") as f:
        soup = BeautifulSoup(f, "html.parser")

    name = soup.find("h1").get_text(strip=True)

    genre_tag = soup.find("p", string=lambda s: s and s.startswith("ジャンル："))
    genre = genre_tag.get_text(strip=True).replace("ジャンル：", "") if genre_tag else ""

    materials = [li.get_text(strip=True) for li in soup.select("ul li")]

    # 作り方抽出
    steps_heading = soup.find("h2", string=lambda s: s and "作り方" in s)
    steps_list = []
    if steps_heading:
        next_ol = steps_heading.find_next("ol")
        if next_ol:
            steps_list = [li.get_text(strip=True) for li in next_ol.find_all("li")]
    steps = "\n".join(steps_list)

    img_tag = soup.find("img")
    image = os.path.basename(img_tag["src"]) if img_tag and "src" in img_tag.attrs else ""

    print("抽出された作り方:", steps)  # ✅ デバッグ出力

    return jsonify({
        "name": name,
        "genre": genre,
        "materials": "\n".join(materials),
        "steps": steps,
        "image": image
    })



    if steps_heading:
        # <h2>作り方</h2> の次の <ol> を探す
        next_ol = steps_heading.find_next("ol")
        if next_ol:
            steps_list = [li.get_text(strip=True) for li in next_ol.find_all("li")]

    # steps_list が空でも空文字列として返す
        steps = "\n".join(steps_list)

        return jsonify({
            "name": name,
            "genre": genre,
            "materials": "\n".join(materials),
            "steps": steps,  # ✅ 修正ポイント
            "image": image
        })



    img_tag = soup.find("img")
    image = os.path.basename(img_tag["src"]) if img_tag and "src" in img_tag.attrs else ""

    return jsonify({
        "name": name,
        "genre": genre,
        "materials": "\n".join(materials),
        "steps": "\n".join(steps),
        "image": image
    })

@app.route("/generate", methods=["POST"])
@app.route("/generate", methods=["POST"])
def generate():
    data = request.form
    recipe_id = data.get("id", "").strip()  # ← 選択された元レシピIDを使う
    filename = f"recipe_{recipe_id or 'noid'}.html"
    html = render_template("recipe_template.html", **data)
    os.makedirs("output", exist_ok=True)
    with open(os.path.join("output", filename), "w", encoding="utf-8") as f:
        f.write(html)
    return f"{filename} を生成しました！"


def open_browser():
    webbrowser.open_new("http://localhost:5000/create")

if __name__ == "__main__":
    threading.Timer(1.0, open_browser).start()
    app.run(debug=True)
