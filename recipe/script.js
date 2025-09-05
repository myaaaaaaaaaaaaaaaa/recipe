let allRecipes = [];
let filteredRecipes = [];
let selectedIngredients = [];

// レシピデータを読み込み
fetch('recipes.json')
.then(response => response.json())
.then(data => {
  allRecipes = data;
  filteredRecipes = [...allRecipes];
  displayWelcomeMessage();
})
.catch(error => {
  console.error('レシピの読み込みに失敗しました:', error);
  document.getElementById('results-info').innerHTML = 
    '<p style="color: #e74c3c;">レシピデータの読み込みに失敗しました。</p>';
});

// 初期メッセージを表示
function displayWelcomeMessage() {
  const resultsInfo = document.getElementById('results-info');
  const container = document.getElementById('recipe-container');
  
  resultsInfo.innerHTML = `
    <h3>🎯 材料を入力してレシピを検索しましょう</h3>
    <p>冷蔵庫にある材料を上の検索ボックスに入力して、作れる料理を見つけてください。</p>
  `;
  
  container.innerHTML = '';
}

// 材料タグを追加
function addIngredientTag() {
  const input = document.getElementById('ingredient-input');
  const ingredient = input.value.trim();
  
  if (ingredient && !selectedIngredients.includes(ingredient)) {
    selectedIngredients.push(ingredient);
    updateIngredientTags();
    input.value = '';
    
    // 自動的にレシピを検索
    if (selectedIngredients.length > 0) {
      searchByIngredients();
    }
  }
}

// 材料タグの表示を更新
function updateIngredientTags() {
  const container = document.getElementById('selected-ingredients');
  
  if (selectedIngredients.length === 0) {
    container.innerHTML = '';
    return;
  }
  
  container.innerHTML = selectedIngredients.map(ingredient => `
    <div class="ingredient-tag">
      <span>${ingredient}</span>
      <button class="remove-btn" onclick="removeIngredient('${ingredient}')">×</button>
    </div>
  `).join('');
}

// 材料を削除
function removeIngredient(ingredient) {
  selectedIngredients = selectedIngredients.filter(item => item !== ingredient);
  updateIngredientTags();
  
  if (selectedIngredients.length > 0) {
    searchByIngredients();
  } else {
    displayWelcomeMessage();
  }
}

// 材料をクリア
function clearIngredients() {
  selectedIngredients = [];
  updateIngredientTags();
  document.getElementById('ingredient-input').value = '';
  displayWelcomeMessage();
}

// 材料に基づいてレシピを検索
function searchByIngredients() {
  if (selectedIngredients.length === 0) {
    displayWelcomeMessage();
    return;
  }

  // 材料にマッチするレシピを検索し、マッチ度でスコア付け
  filteredRecipes = allRecipes.map(recipe => {
    let matchCount = 0;
    const matchedIngredients = [];
    
    selectedIngredients.forEach(selectedIng => {
      const found = recipe.ingredients.find(recipeIng => 
        recipeIng.toLowerCase().includes(selectedIng.toLowerCase()) ||
        selectedIng.toLowerCase().includes(recipeIng.toLowerCase())
      );
      if (found) {
        matchCount++;
        matchedIngredients.push(found);
      }
    });
    
    return {
      ...recipe,
      matchCount,
      matchedIngredients,
      matchPercentage: Math.round((matchCount / selectedIngredients.length) * 100)
    };
  }).filter(recipe => recipe.matchCount > 0);

  updateResultsInfo();
  sortAndDisplay();
}

// 結果情報を更新
function updateResultsInfo() {
  const resultsInfo = document.getElementById('results-info');
  const totalRecipes = filteredRecipes.length;
  
  if (totalRecipes === 0) {
    resultsInfo.innerHTML = `
      <h3>😅 該当するレシピが見つかりません</h3>
      <p>入力した材料: <strong>${selectedIngredients.join(', ')}</strong></p>
      <p>別の材料を試すか、「全てのレシピを表示」ボタンで他のレシピを見てみましょう。</p>
    `;
  } else {
    const perfectMatches = filteredRecipes.filter(r => r.matchCount === selectedIngredients.length).length;
    const partialMatches = totalRecipes - perfectMatches;
    
    resultsInfo.innerHTML = `
      <h3>🎉 ${totalRecipes}件のレシピが見つかりました！</h3>
      <p>入力した材料: <strong>${selectedIngredients.join(', ')}</strong></p>
      ${perfectMatches > 0 ? `<p>✅ 完全一致: ${perfectMatches}件</p>` : ''}
      ${partialMatches > 0 ? `<p>🔸 部分一致: ${partialMatches}件</p>` : ''}
    `;
  }
}

// 全てのレシピを表示
function showAllRecipes() {
  filteredRecipes = [...allRecipes];
  
  const resultsInfo = document.getElementById('results-info');
  resultsInfo.innerHTML = `
    <h3>📋 全てのレシピ (${allRecipes.length}件)</h3>
    <p>材料を入力すると、その材料で作れる料理を絞り込めます。</p>
  `;
  
  // マッチ情報をリセット
  filteredRecipes = allRecipes.map(recipe => ({
    ...recipe,
    matchCount: 0,
    matchedIngredients: [],
    matchPercentage: 0
  }));
  
  sortAndDisplay();
}

// レシピを表示する関数
function displayRecipes(recipes) {
  const container = document.getElementById('recipe-container');
  
  if (recipes.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>🔍 レシピが見つかりません</h3>
        <p>検索条件を変更してみてください。</p>
      </div>
    `;
    return;
  }

  container.innerHTML = recipes.map(recipe => {
    const ingredientsList = recipe.ingredients.map(ingredient => {
      const isMatched = recipe.matchedIngredients && 
                       recipe.matchedIngredients.some(matched => 
                         matched.toLowerCase().includes(ingredient.toLowerCase()) ||
                         ingredient.toLowerCase().includes(matched.toLowerCase())
                       );
      
      return `<span class="ingredient-item ${isMatched ? 'matched' : ''}">${ingredient}</span>`;
    }).join('');
    
    const matchInfo = recipe.matchCount > 0 ? `
      <div class="match-info">
        🎯 材料一致: ${recipe.matchCount}/${selectedIngredients.length}個 
        (${recipe.matchPercentage}%)
      </div>
    ` : '';
    
    return `
      <div class="recipe-card">
        <img src="${recipe.photo}" alt="${recipe.name}" 
             onerror="this.src='images/NO_IMAGE.jpg';" />
        <div class="content">
          <h2>${recipe.name}</h2>
          <div class="recipe-id">ID: ${recipe.id}</div>
          <div class="description">${recipe.description}</div>
          <div class="ingredients-section">
            <h3>🥕 材料 (${recipe.ingredients.length}個)</h3>
            <div class="ingredients-list">${ingredientsList}</div>
          </div>
          ${matchInfo}
        </div>
      </div>
    `;
  }).join('');
}

// 並べ替えして表示
function sortAndDisplay() {
  sortRecipes();
  displayRecipes(filteredRecipes);
}

// 並べ替え機能
function sortRecipes() {
  const sortBy = document.getElementById('sort-select').value;
  
  filteredRecipes.sort((a, b) => {
    switch(sortBy) {
      case 'match':
        // マッチ数の多い順、同じ場合は材料数の少ない順
        if (b.matchCount !== a.matchCount) {
          return b.matchCount - a.matchCount;
        }
        return a.ingredients.length - b.ingredients.length;
        
      case 'simple':
        // 材料数の少ない順
        return a.ingredients.length - b.ingredients.length;
        
      case 'name':
        return a.name.localeCompare(b.name, 'ja');
        
      default:
        return a.id.localeCompare(b.id);
    }
  });
}

// キーボードイベント
document.addEventListener('DOMContentLoaded', function() {
  const ingredientInput = document.getElementById('ingredient-input');
  
  if (ingredientInput) {
    ingredientInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        addIngredientTag();
      }
    });
    
    // 入力時の自動提案機能（将来的に拡張可能）
    ingredientInput.addEventListener('input', function(e) {
      // ここに材料の自動補完機能を追加できます
    });
  }
});