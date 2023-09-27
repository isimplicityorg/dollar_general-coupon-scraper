// Function to extract data or set to blank if not found
function extractValueOrBlank(element, selector) {
  var selectedElement = element.querySelector(selector);
  console.log("element=" + element + " " + "selector =" + selector)
  return selectedElement ? selectedElement.textContent.trim() : '';
}

var html = document.documentElement.outerHTML;

// Create a new DOMParser
var parser = new DOMParser();

// Parse the HTML
var doc = parser.parseFromString(html, 'text/html');

// Select all card elements in the DOM
var cardElements = doc.querySelectorAll('.coupons_results-list-item');

// Create an array to store JSON objects for each card
var cardDataList = [];

// Loop through each card element
cardElements.forEach((cardElement) => {
  var brand = extractValueOrBlank(cardElement, '.deal-card__brand');
  //var name = extractValueOrBlank(cardElement, '.deal-card__name').replace("Save|Spend","");

var rawValue = extractValueOrBlank(cardElement, '.deal-card__name');
	var priceMatches = rawValue.match(/\$\d+(\.\d{2})?/);
	var name = priceMatches && priceMatches[0] ? priceMatches[0] : rawValue;  // do nothing if no match

  var description = extractValueOrBlank(cardElement, '.deal-card__description');

  var expiration = extractValueOrBlank(cardElement, '.deal-card__expiration').replace(/.*?(\d{2}\/\d{2}\/\d{2}).*/g, '$1');
//var href = extractValueOrBlank(cardElement, 'a.deal-card__image-wrapper['href']');


const elementhref = cardElement.querySelector('.deal-card__image-wrapper');

if (elementhref) {
  var href = elementhref.getAttribute('href');
  console.log(href); // This will log the href attribute value
} else {
  console.error('Element not found.');
}  
  

objHref = parseURL(href) 
urlProtocol = objHref.protocol;
urlHost =  objHref.host;
  
  
  // Extract the coupon type
var couponType = extractValueOrBlank(cardElement,('.deal-card__coupon-type'));


var couponDescription = "";
  //if the first part of the description contains a price then include the word "Save " otherwise do not
  //var couponSave = " coupon - Save "; or  couponSave = " ";
  couponSave = " ";
  if(couponType.toLowerCase() == "dg store")
    {
      couponDescription = couponType + couponSave + name +" "+ description;
    }else if(couponType.toLowerCase() == "manufacture"){
      couponDescription = couponType + couponSave + brand +" "+ name + " " + description;
    }
  /*RULES
  expiration = dealCardExpire.replace("Exp; ","");
dateofinsert = DIGITAL
source = DOLLAR GENERAL
couponValue = dealCardName.replace("Save|Spend","")

If the couponType is "DG Store" then
	couponDescription = couponType + "coupon - " + dealCardName +" "+ dealCardDescription
else if couponType is "manufacture" then
	couponDescription = dealcardcoupontype + " coupon - " + dealcardbrand + " " + dealcardName + " " + dealCardDescription
end if
  
  				<th>Coupon Description</th> ["offerName"] 
				<th>Coupon Value</th> ["cashBack"]
				<th>Expiration Date</th>["expiration"] 
  
  */
  
    var cardData = {
      cashBack:name,
      offerName:couponDescription,
      offerDetails:"",
      expiration:expiration,
      insertDate:"DIGITAL",
      insertId:"DOLLAR GENERAL",
      url:urlProtocol + "//" +urlHost + href,
      categories:"",
      source:"DOLLAR GENERAL",
      couponId:Math.random().toString(36).substring(7)
    };

  // Add the card data to the array
  cardDataList.push(cardData);
});

// Log the array of JSON objects
console.log(JSON.stringify(cardDataList, null, 2));
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
