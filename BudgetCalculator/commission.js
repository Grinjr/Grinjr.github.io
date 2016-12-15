var anthro = 50;
var color = 35;
var additionalCharacters = 75;
var bns = 0;
var extraCharsAmt = 0;

function OnAnthroChecked(anthroCheckbox) {
    if (anthroCheckbox.checked) {
        bns += anthro;
    } else {
        bns -= anthro;
    }
}
function OnColorChecked(colorCheckbox) {
    if (colorCheckbox.checked) {
        bns += color;
    } else {
        bns -= color;
    }
}
function OnAddCharsChecked(addCharsCheckbox, charsAmt) {
    if (addCharsCheckbox.checked) {
        charsAmt.disabled = false;
        extraCharsAmt = additionalCharacters;
        //bns += additionalCharacters;
    } else {
        charsAmt.disabled = true;
        extraCharsAmt = 0;
        //bns -= additionalCharacters;
    }
}

function OnCharsAmtChanged(charsAmt) {
    extraCharsAmt = charsAmt.value * additionalCharacters;
}

function Submit(budget, total) {
    var extras = (bns + extraCharsAmt) / 100;
    var results = budget.value / (1 + extras);
    total.value = results.toFixed(2);
}