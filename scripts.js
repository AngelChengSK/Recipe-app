const homepageImageSection = document.querySelector(
  '[data-homepage-image-section]'
);
const landingPageSection = document.querySelector(
  '[data-landing-page-section]'
);
const suggestionContainer = document.querySelector(
  '[data-suggested-recipes-container]'
);
const searchBtn = document.querySelector('[data-search-btn]');
const searchInputHeader = document.querySelector('[data-header-search-input]');
const searchResultsSection = document.querySelector(
  '[data-search-results-section]'
);
const searchResultContainer = document.querySelector(
  '[data-search-results-container]'
);
const fullRecipeSection = document.querySelector(
  '[data-full-recipe-container]'
);

const previousSearch = 'egg';
const currentPage = 'homepage';

window.addEventListener('DOMContentLoaded', getSuggestion);

searchBtn.addEventListener('click', (e) => {
  toggleSection(searchResultsSection);
  getRecipeList(e);
});

searchResultContainer.addEventListener('click', (e) => {
  if (e.target.parentElement.hasAttribute('data-id')) {
    toggleSection(fullRecipeSection);
    getFullRecipe(e);
  }
});

function toggleSection(sectionToShow) {
  if (sectionToShow.classList.contains('show')) return;

  const sections = [
    homepageImageSection,
    landingPageSection,
    searchResultsSection,
    fullRecipeSection
  ];
  sectionToShow.classList.add('show');

  sections.forEach((section) => {
    if (section !== sectionToShow) section.classList.remove('show');
  });
}

function getRecipeList(e) {
  e.preventDefault();
  const searchPhase = searchInputHeader.value.trim();

  fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchPhase}`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

      let html = '';
      if (data.meals) {
        data.meals.forEach((meal) => {
          html += `
          <div class="result-container" data-id="${meal.idMeal}">
              <img
                class="recipe-img"
                src="${meal.strMealThumb}"
                alt=""
              />
              <div class="recipe-content-container">
                <div class="recipe-name">
                  ${meal.strMeal}
                </div>
               
                <div class="recipe-tags">${meal.strTags}</div>
              </div>
            </div>
        `;
        });
      } else {
        html = 'Sorry';
      }
      searchResultContainer.innerHTML = html;
    });
}

function getFullRecipe(e) {
  e.preventDefault();
  const id = e.target.parentElement.dataset.id;
  fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
    .then((response) => response.json())
    .then((data) => {
      let ingredientsHtml = '';
      for (i = 1; i <= 20; i++) {
        const ingredientKey = `strIngredient${i}`;
        const measureKey = `strMeasure${i}`;
        if (data.meals[0][ingredientKey] !== '') {
          ingredientsHtml += `
            <div class="receipt-ingrident-row">
            <div class="ingredient-and-checkbox">
              <input id="ingredient" type="checkbox">
              <div class="custom-checkbox"></div>
              <label for="ingredient" class="receipt-ingrident-name">${data.meals[0][ingredientKey]}</label>
              </div>
            <div class="receipt-ingrident-amount">${data.meals[0][measureKey]}</div>
            </div>
          `;
        }
      }

      let html = `
          <div class="full-recipe-content-container">
            <div class="recipe-title">${data.meals[0].strMeal}</div>
            <div class="recipe-category">${data.meals[0].strCategory}</div>
            <div class="recipe-area">${data.meals[0].strArea}</div>
            <img
              src="${data.meals[0].strMealThumb}"
              class="full-recipe-image"
              alt=""
            />
            <div class="instructions-header">Instructions</div>
            <div class="full-recipe-instructions">${data.meals[0].strInstructions}</div>
          </div>
          <div class="receipe-ingridents-container">
            <div class="ingredient-header">Ingredients</div>
            <div class="serve-amount-container">
              <span class="serve-amount">Serves</span>
              <button class="serve-btn minus">-</button>
              <span> 1 </span>
              <button class="serve-btn add">+</button>
            </div>
            <div class=receipt-ingridents-details-container>${ingredientsHtml}<div>
          </div>
          `;

      fullRecipeSection.innerHTML = html;
    });
}

async function getList() {
  const request = await fetch(
    `https://www.themealdb.com/api/json/v1/1/filter.php?i=${previousSearch}`
  );
  const data = await request.json();
  return data;
}

async function getFullDetails(id) {
  const request = await fetch(
    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
  );
  const data = await request.json();
  return data;
}

function getSuggestion() {
  getList().then((data) => {
    if (data.meals) {
      const newList = data.meals.splice(0, 4);
      newList.forEach((meal) => {
        const id = meal.idMeal;

        getFullDetails(id).then((fullRecipe) => {
          const html = `
              <div class="suggested-recipe-container" data-id = "${fullRecipe.meals[0].idMeal}">
                <img
                  class="recipe-img"
                  src="${fullRecipe.meals[0].strMealThumb}"
                  alt=""
                />
                <div class="recipe-name">${fullRecipe.meals[0].strMeal}</div>
                <div class="recipe-instructions">${fullRecipe.meals[0].strInstructions}</div>
                <div class="divider"></div>
                <div class="recipe-tags">
                  <div class="recipe-category">#${fullRecipe.meals[0].strCategory}</div>
                  <div class="recipe-area">#${fullRecipe.meals[0].strArea}</div>
                </div>
              </div>
              `;

          newHtml = suggestionContainer.innerHTML + html;
          suggestionContainer.innerHTML = newHtml;
        });
      });
    } else {
      newHtml = 'Sorry';
      suggestionContainer.innerHTML = newHtml;
    }
  });
}
