"use strict"

requirejs.config({
baseUrl: '../js',
paths: {
	image_library: '../image_library',
	ill: "../ill"
}
});

require(["state-machine3", "fitImage", "fitText", "Loader", "image_library/imageSearch", "image_library/images", "HatDraw"], function (StateMachine, fitImage, fitText, Loader, imageSearch, il, HatDraw) {
	function onload() {
		fitImage(contextPicture, picture);
	}

	function checkButtons() {
		var nextLetters = new Set();
		pool.forEach(function (o) {
			var nl = o.text[word.length].toLowerCase();
			if (typeof nl !== "undefined") {
				nextLetters.add(nl);
			}
		});
		console.log(nextLetters);
		Array.from(divKeyboard.children).forEach(function (b) {
			b.style.background = "black";
			b.removeEventListener("click", clickHandler);
			if (
				nextLetters.has(b.innerHTML.toLowerCase())
				) {
				b.style.background = "khaki";
				b.addEventListener("click", clickHandler);
			}
		});
	}

	function render() {
		if (pool.length === 1) {
			picture = loader.newImageAsset(pool[0].src, onload);
			var displayText = pool[0].text.toUpperCase()
			//remove period, replace underscore
			displayText = displayText.slice(0, displayText.length-1);
			displayText = displayText.replace(/_/g, " ");
			fitText(contextWord, displayText);
			divKeyboard.style.display = "none";
		} else {
			fitText(contextWord, word);
			console.log(word, pool.map(function (o) {return o.text;}));
			checkButtons();
		}
	}
	function clickHandler(e) {
		var l = this.innerHTML.toLowerCase();
		console.log("clicked", l);
		pool = filterByCharAtIndex(pool, l, word.length);
		word += l.toUpperCase();
		contextWord.clearRect(0, 0, canvasWord.width, canvasWord.height);
		render();
	}

	function resize() {
		canvasWord.width = canvasWord.parentElement.clientWidth;
		canvasWord.height = canvasWord.parentElement.clientHeight;
		canvasPicture.width = canvasPicture.parentElement.clientWidth;
		canvasPicture.height = canvasPicture.parentElement.clientHeight;
	}

	function filterByCharAtIndex(arr, char, index) {
		return arr.filter(function (o) {
			return o.text[index].toLowerCase() == char;
		})
	}

	var loader = new Loader("../image_library/images/");
	var canvasWord = document.getElementById("word").firstChild;
	var contextWord = canvasWord.getContext("2d");
	var canvasPicture = document.getElementById("picture").firstChild;
	var contextPicture = canvasPicture.getContext("2d");
	var divKeyboard = document.getElementById("keyboard");
	var ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ_.";
	var again = document.getElementById("again");
	Array.from(ABC).forEach(function (l) {
		var button = document.createElement("div");
		button.classList.add("button");
		button.innerHTML = l;
		divKeyboard.appendChild(button);
		button.addEventListener("click", clickHandler);
	});
	var word = "";
	var picture = null;
	//one entry per spelling (remove double meanings randomly)
	var spellings = new Set();
	il.forEach(function (o) {
		spellings.add(o.text);
	});
	var uniqueil = [];
	spellings.forEach(function (s) {
		uniqueil.push(imageSearch.searchText(s));
	});
	il = uniqueil;
	//add terminal character
	il = il.map(function (o) {
		o.text += ".";
		o.text = o.text.replace(/ /g,"_");
		return o;
	});
	var pool = il.slice();
	
	checkButtons();
	resize();
	
	window.addEventListener("resize", function () {
		resize();
	});
	again.addEventListener("pointerdown", function () {
		console.log("AGAIN");
		word = "";
		pool = il.slice();
		contextWord.clearRect(0, 0, canvasWord.width, canvasWord.height);
		contextPicture.clearRect(0, 0, canvasPicture.width, canvasPicture.height);
		divKeyboard.style.display = "";
		render();
	});
	
});
