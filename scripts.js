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
const recipesFound = document.querySelector('[data-recipes-found');
const fullRecipeSection = document.querySelector(
  '[data-full-recipe-container]'
);

let previousSearch = 'egg';
const currentPage = 'homepage';

window.addEventListener('DOMContentLoaded', () => {
  renderSuggestion();
});

appTitle.addEventListener('click', () => {
  toggleSection(homepageImageSection, landingPageSection);
});

searchBtn.addEventListener('click', (e) => {
  e.preventDefault();
  if (searchInputHeader.value === null || searchInputHeader.value === '')
    return;
  toggleSection(searchResultsSection);
  renderSearchResult(searchInputHeader.value);
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

async function getListByIngredient(ingredient) {
  //need to use await, so that the request variable will wait after the promise is resolved, and be assigned with the response, instead of the promise
  const response = await fetch(
    `https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`
  );

  //.json() is an async method (it returns a Promise itself)
  //need to use await, so that the data variable will wait after the promise is resolved, and be assigned with the result, instead of the promise
  const data = await response.json();

  if (!data.meals) return;

  const listOfId = data.meals.map((meal) => {
    return meal.idMeal;
  });

  return listOfId;

  // the following code will do the same thing,
  // .then() will only be executed after the promise is resolved
  // so no need to use await
  // =====================================================
  // return fetch(
  //   `https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`
  // )
  //   .then((response) => response.json())
  //   .then((data) => {
  //     return data.meals.map((meal) => {
  //       return meal.idMeal;
  //     });
  //   });
  //=======================================================
}

async function getListByName(name) {
  const request = await fetch(
    `https://www.themealdb.com/api/json/v1/1/search.php?s=${name}`
  );
  const data = await request.json();
  if (!data.meals) return;
  const listOfId = data.meals.map((meal) => {
    return meal.idMeal;
  });
  return listOfId;
}

async function getListByCategory(category) {
  const request = await fetch(
    `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`
  );
  const data = await request.json();
  if (!data.meals) return;
  const listOfId = data.meals.map((meal) => {
    return meal.idMeal;
  });
  return listOfId;
}

async function getListByArea(area) {
  const request = await fetch(
    `https://www.themealdb.com/api/json/v1/1/filter.php?a=${area}`
  );
  const data = await request.json();
  if (!data.meals) return;
  const listOfId = data.meals.map((meal) => {
    return meal.idMeal;
  });
  return listOfId;
}

//will return the promise
function getSingleRecipe(id) {
  return fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
    .then((Response) => Response.json())
    .then((data) => {
      return data.meals[0];
    });
}

function getAllRecipes(list) {
  const requests = list.map((id) => {
    return getSingleRecipe(id);
  });
  return Promise.all(requests);
}

async function getFilteredListOfId(input) {
  const listOne = (await getListByIngredient(input)) || [];
  const listTwo = (await getListByName(input)) || [];
  const listThree = (await getListByCategory(input) || [])
  const listFour = (await getListByArea(input) || [])

  if (listOne.length === 0 && listTwo.length === 0 && listThree.length === 0 && listFour.length === 0) return;
  const CombinedList = listOne.concat(listTwo).concat(listThree).concat(listFour);
  //will return the id which the indexOf(id) equal to its current index
  //so for duplicate id, its indexOf(id) will return position of the first occurance of id
  const filteredList = CombinedList.filter((id, index) => {
    return CombinedList.indexOf(id) == index;
  });
  return filteredList;
}

async function renderSearchResult(input) {
  const filteredList = await getFilteredListOfId(input)
  if (!filteredList) {
    searchResultContainer.innerHTML = '<div>Sorry</div>';
    recipesFound.innerText = `No recipe found`;
    return;
  }

  let htmlArray = await getAllRecipes(filteredList).then((recipes) => {
    return recipes.map((recipe) => {
      return `
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
  });
  const html = htmlArray.join('');
  searchResultContainer.innerHTML = html;
  recipesFound.innerText = `${filteredList.length} recipe(s) found`;
  previousSearch = input;
}

function renderFullRecipe(e) {
  // e.preventDefault();
  const id = e.target.parentElement.dataset.id;
  getSingleRecipe(id).then((data) => {
    let ingredientsHtml = '';

    for (i = 1; i <= 20; i++) {
      const ingredientKey = `strIngredient${i}`;
      const measureKey = `strMeasure${i}`;

      if (data[ingredientKey] !== '' && data[ingredientKey] !== null) {
        ingredientsHtml += `
            <div class="receipt-ingrident-row">
            <div class="ingredient-and-checkbox">
              <input id="${data.idMeal}${i}" type="checkbox">
              <div class="custom-checkbox"></div>
              <label for="${data.idMeal}${i}" class="receipt-ingrident-name">${data[ingredientKey]}</label>
              </div>
            <div class="receipt-ingrident-amount">${data[measureKey]}</div>
            </div>
          `;
      }
    }

    let finalHtml = `
          <div class="full-recipe-content-container">
            <div class="recipe-title">${data.strMeal}</div>
            <div class="full-recipe category">${data.strCategory}</div>
            <div class="full-recipe area">${data.strArea}</div>
            <img
              src="${data.strMealThumb}"
              class="full-recipe-image"
              alt=""
            />
            <div class="instructions-header">Instructions</div>
            <div class="full-recipe-instructions">${data.strInstructions}</div>
          </div>
          <div class="receipe-ingridents-container">
            <div class="ingredient-header">Ingredients</div>
            <div class=receipt-ingridents-details-container>${ingredientsHtml}<div>
          </div>
          `;

    fullRecipeSection.innerHTML = finalHtml;
  });
}

// {/* <div class="serve-amount-container">
// <span class="serve-amount">Serves</span>
// <button class="serve-btn minus">-</button>
// <span> 1 </span>
// <button class="serve-btn add">+</button>
// </div> */}

async function renderSuggestion() {
  const filteredList = await getFilteredListOfId(previousSearch)

  let htmlArray = await getAllRecipes(filteredList).then((recipes) => {
    return recipes.map((recipe) => {
      return `
      <div class="suggested-recipe-container" data-id = "${recipe.idMeal}">
        <img
          class="recipe-img"
          src="${recipe.strMealThumb}"
          alt=""
        />
        <div class="recipe-name">${recipe.strMeal}</div>
        <div class="recipe-instructions">${recipe.strInstructions}</div>
        <div class="divider"></div>
        <div class="recipe-tags">
          <div class="suggest-recipe category">#${recipe.strCategory}</div>
          <div class="suggest-recipe area">#${recipe.strArea}</div>
        </div>
      </div>
      `;
    });
  });
  const html = htmlArray.join('');
  suggestionContainer.innerHTML = html;
}


Promise.all()