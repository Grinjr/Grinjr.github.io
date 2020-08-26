var results = document.getElementById('Results');
//console.log(results.innerText);

document.getElementById('APISubmitButton').addEventListener (
    "click", LoadAPI, false
);
	
var items = [];
var categoryInfo = [];
var recItemsToSell = [];

var daysToCheck = 0;

var categoryRequest = new XMLHttpRequest();
categoryRequest.open('GET', 'https://api.guildwars2.com/v2/materials', true);
categoryRequest.onload = function() {
	var data = JSON.parse(this.response);
	
	for (c = 0; c < data.length; c++) {
		var categoryInfoRequest = new XMLHttpRequest();
		categoryInfoRequest.open('GET', 'https://api.guildwars2.com/v2/materials/' + data[c], true);
		categoryInfoRequest.onload = function() {
			var categoryData = JSON.parse(this.response);
			
			categoryInfo[categoryData.id] = categoryData.name;
			//console.log(categoryInfo);
		}
		categoryInfoRequest.send();
	}
}
categoryRequest.send();

function LoadAPI(evt) {
	daysToCheck = document.getElementById('days').value;
	var APIKey = document.getElementById('APIToken').value.trim();
	//console.log(APIKey);
	
	var request = new XMLHttpRequest();
	request.open('GET', 'https://api.guildwars2.com/v2/account/materials?access_token=' + APIKey, true);
	
	request.onload = function() {
		var data = JSON.parse(this.response);
		//console.log(data);
		var ids = [];
		
		for (i = 0; i < data.length; i++) {
			//results.innerText += "\r\n" + JSON.stringify(data[i]);
			if (!items[data[i].category]) {
				items[data[i].category] = [];
			}
			items[data[i].category][data[i].id] = {count: data[i].count};
			var chunk = Math.floor(i / 199);
			if (!ids[chunk]) {
				ids[chunk] = [];
			}
			ids[chunk].push({id: data[i].id, category: data[i].category});
		}
		//console.log(items);
		
		for (chunk = 0; chunk < ids.length; chunk++) {
			var itemInfoUrl = 'https://api.guildwars2.com/v2/items?ids=';
			for (i = 0; i < ids[chunk].length; i++) {
				itemInfoUrl += ids[chunk][i].id + ",";
			}
			//console.log(itemInfoUrl);
			var itemInfoReq = new XMLHttpRequest();
			itemInfoReq.open('GET', itemInfoUrl, true);
			
			itemInfoReq.onload = (function(chunk) {
				return function() {
					var itemInfo = JSON.parse(this.response);
					for (i = 0; i < itemInfo.length; i++) {
						var itemId = itemInfo[i].id;
						var category = 0;
						for (id = 0; id < ids[chunk].length; id++) {
							//console.log(ids[chunk][id].id, itemId);
							if (ids[chunk][id].id == itemId) {
								category = ids[chunk][id].category;
							}
						}
						items[category][itemId].info = itemInfo[i];
					}
					if (chunk == ids.length - 1) {
						//console.log("Finished Loading");
						setTimeout(FinishedLoadingMaterials, 500);
					}
				}
			})(chunk);
				
			itemInfoReq.send();
		}
	}
	request.send();
}

function GetPrices(item, category) {
	//console.log(item.info.flags);
	if (item.info.flags.includes('AccountBound') || item.info.flags.includes('SoulbindOnAcquire')) {
		return "Soulbound";
	}
	
	var itemPriceReq = new XMLHttpRequest();
	itemPriceReq.open('GET', 'https://www.gw2spidy.com/api/v0.9/json/listings/' + item.info.id + '/sell', false);
	itemPriceReq.send(null);
	
	if (itemPriceReq.status === 200) {
		var priceInfo = JSON.parse(itemPriceReq.responseText);
		//console.log(priceInfo);
		
		if (!priceInfo.results[0]) {
			return "--";
		}
		items[category][item.info.id].prices = {currentPrice: priceInfo.results[0].unit_price, history: priceInfo.results};
		
		var currentPriceReq = new XMLHttpRequest();
		currentPriceReq.open('GET', 'https://api.guildwars2.com/v2/commerce/prices/' + item.info.id, false);
		currentPriceReq.send(null);
		
		if (currentPriceReq.status === 200) {
			items[category][item.info.id].prices.currentPrice = JSON.parse(currentPriceReq.responseText).sells.unit_price;
			
			return items[category][item.info.id].prices.currentPrice;
		}
	}
	return "--";
}

function GetPriceRanges(item) {
	if (!item.prices) {
		return {currentPrice: 0, highPrice: 0, lowPrice: 0, averagePrice: 0};
	}
	var currentPrice = item.prices.currentPrice;
	var highPrice = currentPrice;
	var lowPrice = currentPrice;
	var averagePrice = 0;
	var len = item.prices.history.length;
	for (i = 0; i < item.prices.history.length; i++) {
		var date = new Date(item.prices.history[i].listing_datetime.substring(0, 10));
		var dateOffset = (24 * 60 * 60 * 1000) * daysToCheck;
		var deadline = new Date(date - dateOffset);
		//console.log("Date:" + date.toLocaleString(), "Deadline: " + deadline.toLocaleString());
		if (date >= deadline) {
			if (item.prices.history[i].unit_price > highPrice) {
				highPrice = item.prices.history[i].unit_price;
			}
			else if (item.prices.history[i].unit_price < lowPrice) {
				lowPrice = item.prices.history[i].unit_price;
			}
			averagePrice += item.prices.history[i].unit_price;
		}
		else {
			len--;
		}
	}
	averagePrice /= len;
	
	return {currentPrice: currentPrice, highPrice: highPrice, lowPrice: lowPrice, averagePrice: averagePrice};
}

function GetColor(item) {
	var ranges = GetPriceRanges(item);
	var currentPrice = ranges.currentPrice;
	var high = ranges.highPrice;
	var low = ranges.lowPrice;
	var average = ranges.averagePrice;
	
	if (!currentPrice || currentPrice == 0 || item.count == 0) {
		return "rgba(0,0,0,0.8)";
	}
	var perc = 0;
	if (currentPrice > average) {
		var perc = (currentPrice - average) / (high - average);
		if (perc >= 0.75) {
			recItemsToSell.push(item);
		}
		perc = (perc / 2) + 0.5
	}
	else {
		var perc = (currentPrice - low) / (average - low);
		perc /= 2;
	}
	
	var red = Math.round(255 * (1 - perc));
	var green = Math.round(255 * perc);
	if (!red && !green) {
		return "rgba(0,0,0,0.8)";
	}
	//console.log(currentPrice, perc, low, average, high, "rgba(" + red + "," + green + ",0,0.7)");
	return "rgba(" + red + "," + green + ",0,0.8)";
}

function FinishedLoadingMaterials() {
	//console.log(items);
	results.innerHTML = "";
	items.forEach(function(categoryData, category) {
		results.innerHTML += "<br><br><br><h1>" + categoryInfo[category] + "</h1><p>";
		var x = 0;
		categoryData.forEach(function(itemData, id) {
			results.innerHTML += '<img src="' + itemData.info.icon + '" title="' + itemData.info.name + " x" + itemData.count + " (Price: " + GetPrices(itemData, category) + ')" ' + 'style="outline: 100px solid ' + GetColor(itemData) + ' !important; outline-offset: -100px; overflow: hidden; position: relative; height:50px; width:50px;"' + '></img>';
			x++;
			if (x > 10) {
				results.innerHTML += "<br>";
				x = 0;
			}
		});
		results.innerHTML += "</p>"
	});
	
	results.innerHTML += "<br><br><br><br><br><p>Items recommended to sell:<br>";
	for (i = 0; i < recItemsToSell.length; i++) {
		results.innerHTML += recItemsToSell[i].info.name + "<br>";
	}
}
