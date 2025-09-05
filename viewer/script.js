fetch('recipes.json')
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById('recipe-container');
    data.forEach(recipe => {
      const card = document.createElement('div');
      card.className = 'recipe-card';

      card.innerHTML = `
        <img src="${recipe.photo}" alt="${recipe.name}" onerror="this.src='images/NO_IMAGE.jpg';" />
        <div class="content">
          <h2>${recipe.name}</h2>
          <p><strong>ID:</strong> ${recipe.id}</p>
          <p>${recipe.description}</p>
          <h3>材料:</h3>
          <ul>${recipe.ingredients.map(ing => `<li>${ing}</li>`).join('')}</ul>
        </div>
      `;
      container.appendChild(card);
    });
  })
  .catch(error => {
    console.error('レシピの読み込みに失敗しました:', error);
  });
