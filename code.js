function startParsing(){
var html = document.documentElement.outerHTML;
var parser = new DOMParser();
var doc = parser.parseFromString(html, 'text/html');
var cardElements = doc.querySelectorAll('.coupons_results-list-item');
var cardDataList = [];
var brand = "";
var couponDescription = "";
var rawValue = "";
var priceMatches = "";
var cashBack = "";
var description = "";
var expiration = "";
var couponIdElement = "";
var elementhref = "";
var href = "";
var couponType = "";
var cardData = {};
cardElements.forEach((cardElement) => {
  try {
    brand = extractValueOrBlank(cardElement, '.deal-card__brand');
  } catch {
    //do something
  }

  try {
    rawValue = extractValueOrBlank(cardElement, '.deal-card__name');
    priceMatches = rawValue.match(/\$\d+(\.\d{2})?/);
    cashBack = priceMatches && priceMatches[0] ? priceMatches[0] : rawValue;  // do nothing if no match
  } catch {
    //do something
  }
  
  try {
    description = extractValueOrBlank(cardElement, '.deal-card__description');
  } catch {
    //do something
  }
  
  try {
    expiration = extractValueOrBlank(cardElement, '.deal-card__expiration').replace(/.*?(\d{2}\/\d{2}\/\d{2}).*/g, '$1');
    couponIdElement = cardElement.querySelector('.deal-card__add-button');
    if (couponIdElement) {
      var couponId = couponIdElement.getAttribute('data-deal-code');
      if (couponId == "") {
        couponId = "cc-" + Math.random().toString(36).substring(7);
      }

    }
  } catch {
    expiration = "";
    couponId = "cc-" + Math.random().toString(36).substring(7);
  }
  elementhref = cardElement.querySelector('.deal-card__image-wrapper');

  if (elementhref) {
    href = elementhref.getAttribute('href');
  } else {
    //do something
  }

  objHref = parseURL(href)
  urlProtocol = objHref.protocol;
  urlHost = objHref.host;
  
  couponType = extractValueOrBlank(cardElement, ('.deal-card__coupon-type'));
  couponSave = " ";
  if (couponType.toLowerCase() == "dg store") {
    couponDescription = couponType + couponSave + cashBack + " " + description;
  } else if (couponType.toLowerCase() == "manufacturer") {
    couponDescription = couponType + couponSave + brand + " " + cashBack + " " + description;
  } else {
    couponDescription = "couponType=" + couponType + "brand=" + brand + "cashBack=" + cashBack + "description=" + description
  }

  if (couponDescription != "" && cashBack != "") {
    var cardData = {
      cashBack: cashBack,
      offerName: couponDescription,
      offerDetails: "",
      expiration: expiration,
      insertDate: "DIGITAL",
      insertId: "DOLLAR GENERAL",
      url: urlProtocol + "//" + urlHost + href,
      categories: "",
      source: "DOLLAR GENERAL",
      couponId: couponId
    };
  } else {
    cardData = {
      error: "missing name and description",
      url: urlProtocol + "//" + urlHost + href,
      couponId: couponId
    };
  }
  cardDataList.push(cardData);
});

// Log the array of JSON objects
console.log(JSON.stringify(cardDataList, null, 2));
}
// Function to extract data or set to blank if not found
function extractValueOrBlank(element, selector) {
  var selectedElement = element.querySelector(selector);
  return selectedElement ? selectedElement.textContent.trim() : '';
}

function parseURL(url) {
  const parser = document.createElement('a');
  parser.href = url;
  return {
    protocol: parser.protocol,
    host: parser.host,
    hostname: parser.hostname,
    port: parser.port,
    pathname: parser.pathname,
    search: parser.search,
    hash: parser.hash,
  };
}
function scrollDown(element){
  window.scrollBy(0, 500);
  //OR                    
  window.scrollTo(0, window.scrollY + 500);
  //OR
  // Using scrollIntoView:
element.scrollIntoView();
}
// Listen for the DOMContentLoaded event to ensure the page has loaded
// Function to click the "Load more" button
function clickLoadMoreButton() {
  const loadMoreButton = document.querySelector('.coupons-results__load-more-button');
  if (loadMoreButton && !loadMoreButton.classList.contains('hidden')) {
    loadMoreButton.click();
    setTimeout(clickLoadMoreButton, 1000); // Click every second (adjust the delay as needed)
  }
}
go();//go is just for testing since we are pushing the run button in the console and not attaching this code directly
// Listen for the DOMContentLoaded event to ensure the page has loaded
//document.addEventListener('DOMContentLoaded', () => {
function go(){
// Start clicking the button immediately when the page loads
  clickLoadMoreButton();

  // Function to begin parsing after clicking stops (e.g., button is no longer in the DOM or is hidden)
  function startParsing() {
    // Your parsing logic here
    console.log('Parsing the page...');
  }

  // Check for the presence and visibility of the "Load more" button at regular intervals
  const checkButtonInterval = setInterval(() => {
    const loadMoreButton = document.querySelector('.coupons-results__load-more-button');
    if (!loadMoreButton || loadMoreButton.classList.contains('hidden')) {
      // The button is no longer in the DOM or is hidden, so start parsing
      clearInterval(checkButtonInterval);
      startParsing();
    }
  }, 1000); // Check every second (adjust the interval as needed)
};




