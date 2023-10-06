function startParsing() {
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
          couponId = createCouponId("cc-");
        }

      }
    } catch {
      expiration = "";
      couponId = createCouponId("cc-");
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
      couponDescription = couponSave + cashBack + " " + description + "-" + couponType;
    } else if (couponType.toLowerCase() == "manufacturer") {
      couponDescription = couponSave + brand + " " + cashBack + " " + description + "-" + couponType;
    } else {
      couponDescription =  "brand=" + brand + " cashBack=" + cashBack + " description=" + description + " couponType=" + couponType;
    }
    items = [
      cashBack,
      couponDescription,
      "",
      expiration,
      "DIGITAL",
      "DOLLAR GENERAL",
      urlProtocol + "//" + urlHost + href,
      "",
      "DOLLAR GENERAL",
      couponId
    ];
    
    if (couponDescription != "" && cashBack != "") {
      var cardData = createDatabaseJson(items);
    } else {
      var error = "missing name and description"
      var url = urlProtocol + "//" + urlHost + href
      var couponId = couponId
      var note = "";
      var cardData = createErrorJson(error, url, couponId, note)
    	
    }
    cardDataList.push(cardData);
  });

  // Log the array of JSON objects
  //console.log(JSON.stringify(cardDataList, null, 2));
  createJSONFile(cardDataList, "dollar_general_coupons.json");
  modal = createModal("Dollar General Coupons Scraped. dollar_general_coupons.json created!");
  displayModal(modal, 5000);
}
// Function to extract data or set to blank if not found
function extractValueOrBlank(element, selector) {
  var selectedElement = element.querySelector(selector);
  return selectedElement ? selectedElement.textContent.trim() : '';
}

// Listen for the DOMContentLoaded event to ensure the page has loaded
// Function to click the "Load more" button
function clickLoadMoreButton() {
  const loadMoreButton = document.querySelector('.coupons-results__load-more-button');
  if (loadMoreButton && !loadMoreButton.classList.contains('hidden')) {
    loadMoreButton.click();
    scrollDown(loadMoreButton);
    setTimeout(clickLoadMoreButton, 1000); // Click every second (adjust the delay as needed)
  } else {
    console.log("now scrape the page")
    startParsing();
  }
}

clickLoadMoreButton();