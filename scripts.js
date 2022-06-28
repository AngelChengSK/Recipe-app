const appTitle = document.querySelector('[data-app-title]');
const main = document.querySelector('[data-main]');
const homepageImageSection = document.querySelector(
  '[data-homepage-image-section]'
);
const landingPageSection = document.querySelector(
  '[data-landing-page-section]'
);
const categoriesContainer = document.querySelector(
  '[data-categories-container]'
);
const previousSearchPhase = document.querySelector('[data-previous-search]');
const suggestionContainer = document.querySelector(
  '[data-suggested-recipes-container]'
);

const suggestedRecipeBottom = document.querySelector(
  '[data-suggested-recipe-bottom]'
);
const searchBtns = document.querySelectorAll('[data-search-btn]');
const searchResultsSection = document.querySelector(
  '[data-search-results-section]'
);
const searchResultTitle = document.querySelector('[data-search-result-title]');
const searchResultContainer = document.querySelector(
  '[data-search-results-container]'
);
const recipesFound = document.querySelector('[data-recipes-found');
const fullRecipeSection = document.querySelector(
  '[data-full-recipe-container]'
);

const LOCALSTORAGE_PREVIOUSE_SEARCH_KEY = 'recipeApp-previousSearch';
const LOCALSTORAGE_FAVOURITE_LIST_KEY = 'recipeApp-favouriteList';

let previousSearch = localStorage.getItem(LOCALSTORAGE_PREVIOUSE_SEARCH_KEY);
let favouriteList = localStorage.getItem(LOCALSTORAGE_FAVOURITE_LIST_KEY) || [];

const categories = [
  {
    name: 'Beef',
    image: 'images/beef.png'
  },
  {
    name: 'Chicken',
    image: 'images/chicken.png'
  },
  {
    name: 'Lamb',
    image: 'images/lamb.png'
  },
  {
    name: 'Pork',
    image: 'images/pork.png'
  },
  {
    name: 'Seafood',
    image: 'images/seafood.png'
  },
  {
    name: 'Vegan',
    image: 'images/vegan.png'
  },
  {
    name: 'Breakfast',
    image: 'images/breakfast.png'
  },
  {
    name: 'Side',
    image: 'images/side.png'
  },
  {
    name: 'Dessert',
    image: 'images/dessert.png'
  }
];

window.addEventListener('DOMContentLoaded', () => {
  if (previousSearch) {
    previousSearchPhase.innerText = previousSearch;
  } else {
    previousSearchPhase.innerText = 'nothing';
    previousSearch = 'rice';
  }

  renderSuggestion();
  renderCategoryList();
});

main.addEventListener('click', (e) => {
  if (e.target.hasAttribute('data-arrow')) {
    renderFullRecipe(e.target.dataset.arrow);
  }
});

appTitle.addEventListener('click', () => {
  toggleSection(homepageImageSection, landingPageSection);
  renderSuggestion();
});

searchBtns.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const input = btn.previousElementSibling;
    if (input.value === null || input.value === '') return;
    toggleSection(searchResultsSection);
    renderSearchResult(input.value);
    input.value = '';
  });
});

categoriesContainer.addEventListener('click', (e) => {
  if (e.target.hasAttribute('data-category')) {
    toggleSection(searchResultsSection);
    renderSearchResult(e.target.dataset.category);
    previousSearch = e.target.dataset.category;
  }
});

suggestionContainer.addEventListener('click', (e) => {
  //if click on the child elements, i.e. image/text, and is not the bottom part
  if (
    e.target.parentElement.hasAttribute('data-id') &&
    !e.target.hasAttribute('data-suggested-recipe-bottom')
  ) {
    renderFullRecipe(e.target.parentElement.dataset.id);
    toggleSection(fullRecipeSection);
    return;
  }

  //if click on the recipe itself, i.e. the blank areas with no child elements placed on top
  if (e.target.hasAttribute('data-id')) {
    renderFullRecipe(e.target.dataset.id);
    toggleSection(fullRecipeSection);
    return;
  }

  //if click on the orange hashtags
  if (e.target.hasAttribute('data-hashtag')) {
    renderSearchResult(e.target.dataset.hashtag);
    toggleSection(searchResultsSection);
  }
});

searchResultContainer.addEventListener('click', (e) => {
  if (e.target.hasAttribute('data-id')) {
    toggleSection(fullRecipeSection);
    renderFullRecipe(e.target.dataset.id);
    return;
  }
  if (e.target.hasAttribute('data-hashtag')) {
    renderSearchResult(e.target.dataset.hashtag);
    toggleSection(searchResultsSection);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
  searchResultTitle.innerText = `Search Result(s) for "${input}"`;

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
      <div class="preview result-container" >
        <div class="recipe-owner-details-container">
          <img class="preview owner-img" src="images/user-profile.png">
          <div class="owner-details-text">
            <div class="preview owner-name">Profile Name</div>
            <div class="preview share-time">2h ago</div>
          </div>
        </div>
        <img
          class="preview recipe-img"
          src="${recipe.strMealThumb}"
          alt="${recipe.strMeal}"
        />
        <div class="preview recipe-text-section">
          <div class="preview recipe-name">${recipe.strMeal}</div>
          <div class="preview recipe-instructions">${recipe.strInstructions}</div>
          <div class="preview recipe-bottom">
            <div class="preveiw recipe-tags">
              <div class="preview recipe-category" data-hashtag="${recipe.strCategory}">#${recipe.strCategory}</div>
              <div class="preview recipe-area" data-hashtag="${recipe.strArea}">#${recipe.strArea}</div>
            </div>
            <button class="view-recipe-btn" data-id="${recipe.idMeal}">VIEW RECIPE</button>
          </div>
        </div>
      </div>
      `;
    });
  });
  const html = htmlArray.join('');
  searchResultContainer.innerHTML = html;
  recipesFound.innerText = `${filteredList.length} recipe(s) found`;
  previousSearch = input;
  previousSearchPhase.innerText = previousSearch;
  savePreviousSearch();
}

function renderFullRecipe(id) {
  // e.preventDefault();
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
      <i class="fa-solid fa-angle-left" data-arrow="${data.idMeal - 1}"></i>
      <div class="full-recipe-image-container">
        <img
        src="${data.strMealThumb}"
        class="full-recipe-image"
        alt=""
        />
        <div class="full-recipe-header">      
          <div class="full-recipe-title">${data.strMeal}</div>
          <div class="full-recipe-tags">
            <div class="full-recipe category">${data.strCategory}</div>
            <div class="full-recipe area">${data.strArea}</div>
          </div>
          <div class="full-recipe-owner-details-container">
            <img class="full-recipe owner-img" src="images/user-profile.png">
            <div class="owner-details-text">
              <div class="full-recipe-owner-name">Profile Name</div>
              <div class="full-recipe-share-time">2h ago</div>
            </div>
          </div>
        </div>
      </div>
      <div class="full-recipe-text-container">
        <div class="full-recipe-body">
          <div class="receipe-ingridents-section">
            <div class="ingredient-header">Ingredients</div>
            <div class="receipt-ingridents-details-container">${ingredientsHtml}</div>
          </div>
          <div class="full-recipe-instructions-section">
            <div class="instructions-header">Instructions</div>
            <div class="full-recipe-instructions">${data.strInstructions}</div>
          </div>
        </div>
      </div>
      <i class="fa-solid fa-angle-right" data-arrow="${
        Number(data.idMeal) + 1
      }"></i>
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
        <div class="suggestion recipe-name">${recipe.strMeal}</div>
        <div class="suggestion recipe-instructions">${recipe.strInstructions}</div>
        <div class="divider"></div>
        <div class="suggestion-bottom" data-suggested-recipe-bottom>
          <div class="suggestion recipe-category" data-hashtag="${recipe.strCategory}">#${recipe.strCategory}</div>
          <div class="suggestion recipe-area" data-hashtag="${recipe.strArea}">#${recipe.strArea}</div>
          <img class="suggestion owner-img" src="images/user-profile.png">
        </div>
      </div>
      `;
    });
  });
  const html = htmlArray.join('');
  suggestionContainer.innerHTML = html;
}

function renderCategoryList() {
  let html = '';
  categories.forEach((category) => {
    html += `
    <div class="category-block" data-category="${category.name.toLowerCase()}">
      <img
        class="category-icon"
        src="${category.image}"
        alt="${category.name}"
      />
      <div class="category-name">${category.name}</div>
    </div>
  `;
  });
  categoriesContainer.innerHTML = html;
}

function savePreviousSearch() {
  localStorage.setItem(LOCALSTORAGE_PREVIOUSE_SEARCH_KEY, previousSearch);
}

function saveFavouriteList() {
  localStorage.setItem(LOCALSTORAGE_FAVOURITE_LIST_KEY, favouriteList);
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
