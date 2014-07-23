function caluculate(){
	// var left = parseInt(getVal("left"));
	// var right = parseInt(getVal("right"));
	// var operator = getVal("operator");
	var left = getVal("left");
	var right = getVal("right");
	var operator = etVal("operator");
	var result;
	switch(operator){
		case "plus":
			result = left + right;
			break;
		case "minus":
			result = left - right;
			break;
		case "multi":
			result = left * right;
			break;
		case "division":
			result = left / right;
			break;
	}
	document.getElementById("result").value = result;
}

function getVal (sId) {
	return document.getElementById(sId).value;
}

window.onload = function(){
	document.getElementById("calculate").addEventListener("click",caluculate);
}