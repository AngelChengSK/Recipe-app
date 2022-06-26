const appTitle = document.querySelector('[data-app-title]');
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
const recipesFound = document.querySelector('[data-recipes-found')
const fullRecipeSection = document.querySelector(
  '[data-full-recipe-container]'
);

let previousSearch = 'egg';
const currentPage = 'homepage';
let numRecipesFound = 0;

window.addEventListener('DOMContentLoaded', () => {
  renderSuggestion();
});

appTitle.addEventListener('click', () => {
  toggleSection(homepageImageSection, landingPageSection);
  // toggleSection(h)
});

searchBtn.addEventListener('click', (e) => {
  toggleSection(searchResultsSection);
  renderRecipeList(e);
});

searchResultContainer.addEventListener('click', (e) => {
  if (e.target.parentElement.hasAttribute('data-id')) {
    toggleSection(fullRecipeSection);
    renderFullRecipe(e);
  }
});

function toggleSection(...sectionToShow) {
  const sections = [
    homepageImageSection,
    landingPageSection,
    searchResultsSection,
    fullRecipeSection
  ];

  sectionToShow.forEach((section) => {
    if (!section.classList.contains('show')) {
      section.classList.add('show');
    }
  });

  const sectionToHide = sections.filter(
    (section) => !sectionToShow.includes(section)
  );

  sectionToHide.forEach((section) => {
    section.classList.remove('show');
  });
}

function renderRecipeList(e) {
  e.preventDefault();
  const searchPhase = searchInputHeader.value.trim();
  searchResultContainer.innerHTML = '';
  let html = '';
  numRecipesFound = 0;

  getListByIngredient(searchPhase).then((data) => {
    if (data.meals) {
      numRecipesFound += data.meals.length

      data.meals.forEach((meal) => {
        const id = meal.idMeal;

        getFullDetails(id).then((fullRecipe) => {
          html += `
          <div class="result-container" data-id="${fullRecipe.meals[0].idMeal}">
              <img
                class="recipe-img"
                src="${fullRecipe.meals[0].strMealThumb}"
                alt=""
              />
              <div class="recipe-content-container">
                <div class="recipe-name">
                  ${fullRecipe.meals[0].strMeal}
                </div>
               
                <div class="recipe-tags">${fullRecipe.meals[0].strTags}</div>
              </div>
            </div>
          `;
          searchResultContainer.innerHTML = html;
        });
      });
    }
  });

  getListByName(searchPhase).then((data) => {
    if (data.meals) {
      numRecipesFound += data.meals.length

      data.meals.forEach((recipe) => {
        html += `
        <div class="result-container" data-id="${recipe.idMeal}">
                <img
                  class="recipe-img"
                  src="${recipe.strMealThumb}"
                  alt=""
                />
                <div class="recipe-content-container">
                  <div class="recipe-name">
                    ${recipe.strMeal}
                  </div>
                 
                  <div class="recipe-tags">${recipe.strTags}</div>
                </div>
              </div>
        `;
      });
      searchResultContainer.innerHTML = searchResultContainer.innerHTML + html;
      previousSearch = searchPhase
    }  else if (searchResultContainer.innerHTML === '') {
      searchResultContainer.innerHTML = 'Sorry';
    }
  });

  recipesFound.innerText = `${numRecipesFound} recipe(s) found`;
}

function renderFullRecipe(e) {
  e.preventDefault();
  const id = e.target.parentElement.dataset.id;
  getFullDetails(id)
    // fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
    // .then((response) => response.json())
    .then((data) => {
      let ingredientsHtml = '';
      for (i = 1; i <= 20; i++) {
        const ingredientKey = `strIngredient${i}`;
        const measureKey = `strMeasure${i}`;
        if (data.meals[0][ingredientKey] !== '') {
          ingredientsHtml += `
            <div class="receipt-ingrident-row">
            <div class="ingredient-and-checkbox">
              <input id="${data.meals[0].idMeal}${i}" type="checkbox">
              <div class="custom-checkbox"></div>
              <label for="${data.meals[0].idMeal}${i}" class="receipt-ingrident-name">${data.meals[0][ingredientKey]}</label>
              </div>
            <div class="receipt-ingrident-amount">${data.meals[0][measureKey]}</div>
            </div>
          `;
        }
      }

      let html = `
          <div class="full-recipe-content-container">
            <div class="recipe-title">${data.meals[0].strMeal}</div>
            <div class="full-recipe category">${data.meals[0].strCategory}</div>
            <div class="full-recipe area">${data.meals[0].strArea}</div>
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
            <div class=receipt-ingridents-details-container>${ingredientsHtml}<div>
          </div>
          `;

      fullRecipeSection.innerHTML = html;
    });
}

// {/* <div class="serve-amount-container">
// <span class="serve-amount">Serves</span>
// <button class="serve-btn minus">-</button>
// <span> 1 </span>
// <button class="serve-btn add">+</button>
// </div> */}

async function getListByIngredient(ingredient) {
  const request = await fetch(
    `https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`
  );
  const data = await request.json();
  return data;
}

async function getListByName(name) {
  const request = await fetch(
    `https://www.themealdb.com/api/json/v1/1/search.php?s=${name}`
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

function renderSuggestion() {
  getListByIngredient(previousSearch).then((data) => {
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
                  <div class="suggest-recipe category">#${fullRecipe.meals[0].strCategory}</div>
                  <div class="suggest-recipe area">#${fullRecipe.meals[0].strArea}</div>
                </div>
              </div>
              `;

          const newHtml = suggestionContainer.innerHTML + html;
          suggestionContainer.innerHTML = newHtml;
        });
      });
    } else {
      newHtml = 'Sorry';
      suggestionContainer.innerHTML = newHtml;
    }
  });
}
