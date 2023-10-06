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

//*******************utils.js*********************************************888
// Function to create a single JSON file with all data
function createJSONFile(dataArray, fileName) {

  // Convert the array of extracted data to a JSON string
  var jsonData = JSON.stringify(dataArray,null,2);
  console.log(jsonData)
  // Create a Blob from the JSON string
  var blob = new Blob([jsonData], { type: 'application/json' });

  // Create a URL for the Blob
  var url = URL.createObjectURL(blob);

  // Create a download link for the JSON file
  var a = document.createElement('a');
  a.href = url;
  a.download = fileName;

  // Trigger a click event on the download link to initiate the download
  a.click();
  URL.revokeObjectURL(a.href);
}

function cleanText(text) {
  // Remove non-printable characters and unwanted characters
  if (text == "" || text == null) return;
  text = removeNonUTF8Chars(text);
  //var newText = text.replace(/[^\s!*-~]+/g, '');
  //var newText = text.replace(/[^ -~*]+/g, '');
  var newText = text.replace(/[^\x20-\x7E]|\*/g, '')
  console.log("newText = " + newText)
  return newText;
}

function removeNonUTF8Chars(inputString) {
  console.log(inputString)

  // Use a regular expression to match only UTF-8 characters
  var utf8Regex = /[^\x00-\x7F]+/g;

  // Replace all non-UTF-8 characters with an empty string
  var cleanedString = inputString.replace(utf8Regex, '');

  return cleanedString;
}

var API_KEY = '';  // Be cautious with this
var OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

async function askGpt(prePrompt, description, postPrompt, modelName) {
  if (API_KEY == '') return "Unknown";
  var promptText = prePrompt + description + postPrompt;

  var messages = [
    { "role": "system", "content": "You are a helpful assistant." },
    { "role": "user", "content": promptText }
  ];

  try {
    const response = await fetch(OPENAI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "model": modelName,
        "messages": messages,
        "temperature": 0.7
      })
    });

    const data = await response.json();
    const productType = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content ? data.choices[0].message.content.trim() : "Unknown";
    console.log(productType)
    return productType;
  } catch (error) {
    console.error("Error fetching product type:", error);
    console.error("Response:", response);
  }
}

function scrollDown(element) {
  window.scrollBy(0, 500);
  //OR                    
  window.scrollTo(0, window.scrollY + 500);
  //OR
  // Using scrollIntoView:
  element.scrollIntoView();
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

function createCouponId(prefix) {
  return prefix + Math.random().toString(36).substring(7);
}

// Create a dynamic lightbox modal
function createModal(message) {
  var modal = document.createElement('div');
  modal.className = 'modal';
  document.body.appendChild(modal);
  var modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  modal.appendChild(modalContent);
  var messageElement = document.createElement('p');
  messageElement.textContent = message;
  messageElement.style.fontSize = '18px';
  messageElement.style.color = 'green';
  messageElement.style.fontWeight = 'bold';
  messageElement.style.textAlign = 'center';
  modalContent.appendChild(messageElement);
  modal.style.display = 'none';
  modal.style.position = 'fixed';
  modal.style.zIndex = '1';
  modal.style.left = '0';
  modal.style.top = '0';
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  modalContent.style.backgroundColor = '#fff';
  modalContent.style.padding = '20px';
  modalContent.style.borderRadius = '8px';
  modalContent.style.position = 'absolute';
  modalContent.style.top = '50%';
  modalContent.style.left = '50%';
  modalContent.style.transform = 'translate(-50%, -50%)';
  return modal;
};

function displayModal(modal, delay) {
  modal.style.display = 'block';
  //if delay is a number
  if (!isNaN(delay)) {
    setTimeout(() => {
      modal.style.display = 'none';
    }, delay);
  }
}

function createErrorJson(error="", url="", couponId="", note="") {
  var errorJson = {
    "error": error,
    "url": url,
    "couponId" : couponId,
    "note": note
  }
  return errorJson;
}