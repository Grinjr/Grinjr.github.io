var results = document.getElementById('Results');
console.log(results.innerText);

document.getElementById('APISubmitButton').addEventListener (
    "click", LoadAPI, false
);

function LoadAPI(evt) {
	results.innerText = "Test";

	var APIKey = document.getElementById('APIToken').value.trim();
	console.log(APIKey);
	
	var request = new XMLHttpRequest();
	request.open('GET', 'https://api.guildwars2.com/v2/account/materials', true);
	request.setRequestHeader('Authorization', 'Bearer ' + APIKey);
	
	request.onload = function() {
		var data = JSON.parse(this.response);
		
		console.log(data);
		results.innerText = data;
	}
	request.send();
}