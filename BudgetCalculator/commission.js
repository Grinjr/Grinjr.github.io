var anthroPerc = 50;
var anthroAdd = 0;
var colorPerc = 10;
var colorAdd = 2;
var additionalCharactersPerc = 75;
var additionalCharactersAdd = 0;
var bns = 0;
var bnsAdd = 0;
var extraCharsAmt = 0;
var extraCharsAdd = 0;

function OnAnthroChecked(anthroCheckbox) {
    if (anthroCheckbox.checked) {
        bns += anthroPerc;
        bnsAdd += anthroAdd;
    } else {
        bns -= anthroPerc;
        bnsAdd -= anthroAdd;
    }
}
function OnColorChecked(colorCheckbox) {
    if (colorCheckbox.checked) {
        bns += colorPerc;
        bnsAdd += colorAdd;
    } else {
        bns -= colorPerc;
        bnsAdd -= colorAdd;
    }
}
function OnAddCharsChecked(addCharsCheckbox, charsAmt) {
    if (addCharsCheckbox.checked) {
        charsAmt.hidden = false;
        extraCharsAmt = additionalCharactersPerc;
        extraCharsAdd = additionalCharactersAdd;
        //bns += additionalCharactersPerc;
    } else {
        charsAmt.hidden = true;
        extraCharsAmt = 0;
        extraCharsAdd = 0;
        //bns -= additionalCharactersPerc;
    }
}

function OnCharsAmtChanged(charsAmt) {
    extraCharsAmt = charsAmt.value * additionalCharactersPerc;
    extraCharsAdd = charsAmt.value * additionalCharactersAdd;
}

function Submit(budget, total) {
    var extras = (bns + extraCharsAmt) / 100;
    var results = (budget.value - (bnsAdd + extraCharsAdd)) / (1 + extras);
    total.value = results.toFixed(2);
    total.disabled = false;
}