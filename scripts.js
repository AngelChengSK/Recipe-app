const searchBtn = document.querySelector('[data-search-btn]');
const searchInput = document.querySelector('[data-search-input]');
const searchResultContainer = document.querySelector(
  '[data-search-results-container]'
);
const recipeContainer = document.querySelector('[data-recipe-container]');
// const recipeBtn = document.querySelectorAll('[data-recipe-btn]');

searchBtn.addEventListener('click', renderSearchResults);
searchResultContainer.addEventListener('click', (e) => {
  if (e.target.hasAttribute('data-recipe-btn')) {
    renderRecipe(e)
  }
});

function renderSearchResults() {
  const searchPhase = searchInput.value.trim();

  fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchPhase}`)
    .then((Response) => Response.json())
    .then((data) => {
      let html = '';
      if (data.meals) {
        data.meals.forEach((meal) => {
          html += `
          <div class="search-result-container" data-meal-id = "${meal.idMeal}">
            <div class="meal-img-container">
              <img
                class="meal-img"
                src="${meal.strMealThumb}"
                alt=""
              />
            </div>
            <div class="meal-name">${meal.strMeal}</div>
            <button data-recipe-btn>Recipe</button>
          </div>
        `;
        });
      } else {
        html = 'Sorry';
      }
      searchResultContainer.innerHTML = html;
    });
}

function renderRecipe(e) {
  // e.preventDefault();
  const mealId = e.target.parentElement.dataset.mealId;
  fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data)
      let ingredientsHtml = '';
      for (i = 1; i <= 20; i++) {
        const ingredientKey = `strIngredient${i}`
        const measureKey = `strMeasure${i}`
        // console.log(key)
        // console.log(data.key)
        if (data.meals[0][ingredientKey] !== '') {
          ingredientsHtml += `
          <div class="receipt-ingrident-row>
            <div class="receipt-ingrident-name">${data.meals[0][ingredientKey]}</div>
            <div class="receipt-ingrident-amount">${data.meals[0][measureKey]}</div>
          </div>
          `;
        }
      }
      // console.log(ingredientsHtml)

      let html = `
      <div class="recipe-instructions">${data.meals[0].strInstructions}</div>
      <div class="receipe-ingredients-container">
        ${ingredientsHtml}
      </div>
    `;
      console.log(html)
      recipeContainer.innerHTML = html;
    });
}
