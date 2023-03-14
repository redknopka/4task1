function debounce(func, delay){
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { return func.apply(this, args); }, delay);
    };
}
const input = document.querySelector("input");
const searchList = document.querySelector(".search__list");
const sendQuery = (repName) => {
    const query = `https://api.github.com/search/repositories?q=${repName}+in:name&sort=stars`;
    try {
        return fetch(query).then((response) => {
            //console.log(response.status);
            if (response.status === 200) {
                return response.json();
            }
            throw new Error();
        });
    }
    catch (e) {
        console.log(e);
    }
}
async function getReps(repName) {
    try {
        if (!repName) {
            return buildList(0);
        }
        let repsJson = await sendQuery(repName);
        let resultsJSON = (repsJson["items"]).slice(0, RESULTS_AMOUNT);
        //console.dir(resultsJSON);
        return buildList(resultsJSON);
    }
    catch (e) {
        return buildList(0);
    }
}
async function buildList(resultsArray) {
    const searchResults = document.querySelector(".search__results");
    const searchList = document.querySelector(".search__list");
    if (resultsArray === 0) {
        searchResults.classList.add("hidden");
        return 0;
    }
    searchResults.classList.remove("hidden");
    let fragmentResults = document.createDocumentFragment();
    for (let i = 0; i < resultsArray.length; i++) {
        if (searchList.hasChildNodes()) {
            searchList.removeChild(searchList.firstChild);
        }
        let option = document.createElement("option");
        option.text = resultsArray[i]["name"];
        option.value = resultsArray[i]["name"];
        option.classList.add("search__result")
        option.dataset.owner = resultsArray[i]["owner"]["login"];
        option.dataset.stars = resultsArray[i]["stargazers_count"];
        fragmentResults.appendChild(option);
    }
    searchList.appendChild(fragmentResults);
    return resultsArray;
}
function buildFavourites(searchList) {
    const htmlTag = searchList.options[searchList.selectedIndex];
    const value = htmlTag.getAttribute("value");
    const owner = htmlTag.dataset.owner;
    const stars = htmlTag.dataset.stars;
    const favouritesList = document.querySelector(".favourite");
    const newRep = document.createElement("div");
    newRep.classList.add("favourite__repo");
    const wrapperRepo = document.createElement("div");
    wrapperRepo.classList.add("favourite__repo-wrapper");
    const wrapperButton = document.createElement("div");
    wrapperButton.classList.add("favourite__button-wrapper");
    const spanValue = document.createElement("span");
    const spanOwner = document.createElement("span");
    const spanStars = document.createElement("span");
    const closeButton = document.createElement("span");
    closeButton.classList.add("favourite__repo-button_close");
    spanValue.insertAdjacentHTML('afterbegin', `Name: ${value}<br>`);
    spanOwner.insertAdjacentHTML('afterbegin', `Owner: ${owner}<br>`);
    spanStars.insertAdjacentHTML('afterbegin', `Stars: ${stars}<br>`);
    wrapperRepo.appendChild(spanValue);
    wrapperRepo.appendChild(spanOwner);
    wrapperRepo.appendChild(spanStars);
    newRep.appendChild(wrapperRepo);
    wrapperButton.appendChild(closeButton);
    newRep.appendChild(wrapperButton);
    favouritesList.appendChild(newRep);
    /*function handleCloseButton(e) {
        console.log(e);
        const favouriteRepo = e.target.closest(".favourite__repo");
        favouriteRepo.remove();
        closeButton.removeEventListener("click", handleCloseButton);
    }
    closeButton.addEventListener("click", handleCloseButton);*/
    clearSearchList();
}

function clearSearchList() {
    const searchList = document.querySelector(".search__list");
    const searchResults = document.querySelector(".search__results");
    const input = document.querySelector("input");
    searchResults.classList.add("hidden");
    while (searchList.hasChildNodes()) {
        searchList.removeChild(searchList.firstChild);
    }
    input.value = "";
}

const favouritesList = document.querySelector(".favourite");
function handleCloseButton(e) {
    const closeButton = document.querySelector(".favourite__repo-button_close");
    //console.log(e);
    const favouriteRepo = e.target.closest(".favourite__repo");
    favouriteRepo.remove();
}
function handleFavouritesList(e) {
    //console.log(e.target.tagName);
    if (e.target.classList.contains("favourite__repo-button_close")) {
        handleCloseButton(e);
        return;
    }
}
favouritesList.addEventListener("click", handleFavouritesList);


const DELAY = 400;
const RESULTS_AMOUNT = 5;
const debouncedQuery = debounce(getReps, DELAY);
input.addEventListener("input", (event) => {
    debouncedQuery(input.value);
});
searchList.addEventListener("click", function(e) {
    //console.log(searchList.selectedIndex);
    buildFavourites(searchList);
});
