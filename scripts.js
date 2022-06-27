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

let previousSearch = 'chicken';
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

//call four API together to search by category, recipe name, ingredient, and area
//return a promise, when resolved will return an array of modified data received from each API
//as the responses are all structured as [ meals: [...] ], have set to return just data.meals, i.e. the value of meals key
function getAllList(input) {
  const urls = [
    `https://www.themealdb.com/api/json/v1/1/filter.php?i=${input}`,
    `https://www.themealdb.com/api/json/v1/1/search.php?s=${input}`,
    `https://www.themealdb.com/api/json/v1/1/filter.php?c=${input}`,
    `https://www.themealdb.com/api/json/v1/1/filter.php?a=${input}`
  ];

  //promises variable is an array, which define the promise for each url inside urls array
  //each url inside urls array will return the result of its fetch call
  //the result, = the received data, will be processed to return just the value of meals key
  const promises = urls.map((url) => {
    return fetch(url)
      .then((Response) => Response.json())
      .then((data) => {
        return data.meals;
      });
  });
  //pass the four promises as input, *promises variable is an array [promise 1, promise 2, promise 3, promise 4]
  //the four promises will be grouped together as one single promise,
  //this one single promise is resolved when all four promises are resolved,
  //will return an array of the results of the four promises
  return Promise.all(promises);
}

//place one single fetch call using the receipe id, have set to return, data.meals[0], an object
//as this API will always have just one object inside the array of meals key, i.e. [meals: [{...}]]
function getSingleRecipe(id) {
  return fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
    .then((Response) => Response.json())
    .then((data) => {
      return data.meals[0];
    });
}

//place a number of fetch call according to the list of id
//the requests variable is an array, which defines the promise for each id in the list
//for each id in the list, call the fucntion getSingleRecipe(id), which place a fetch call
//when all promises inside the requests variable are resolved, promise.all as one promise is then resolved, and will return an array of results for each fetch call
function getAllRecipes(list) {
  const requests = list.map((id) => {
    return getSingleRecipe(id);
  });
  return Promise.all(requests);
}

// return an array of filtered recipe ids
async function getFilteredListOfId(input) {
  //await is required, so fullList will wait untill the promise, getAllList(input), is resolved and be assigned with the result
  // e.g. [ [ {}, {} ], [ {}, {}, {}], null, null ]
  const fullList = await getAllList(input);
  // filter out the null; flatten the array into [ {}, {}, {}, ...]; map to return just the id [ "52952", "52953", ...]
  const listOfId = fullList
    .filter((list) => {
      return list !== null;
    })
    .flat()
    .map((list) => list.idMeal);

  //if the list is empty, return
  if (listOfId.length === 0) return;

  // filter the list, keep those id when the indexOf(id) equal to its current index
  // so for duplicate id, its indexOf(id) will return position of the first occurance of id
  const filteredList = listOfId.filter((id, index) => {
    return listOfId.indexOf(id) == index;
  });
  return filteredList;
}

async function renderSearchResult(input) {
  const filteredList = await getFilteredListOfId(input);
  if (!filteredList) {
    searchResultContainer.innerHTML = '<div>Sorry</div>';
    recipesFound.innerText = `No recipe found`;
    return;
  }

  //getAllRecipes(filteredList) will return an array of objects, one object is one recipe, each object contains details of a meal
  //for each recipe inside the array, each return a block of html code
  //so will return an array of html code
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
  const filteredList = await getFilteredListOfId(previousSearch);

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

// below function is not in use, just for reference as I wrote notes along the code

async function getListByIngredientHide(ingredient) {
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
