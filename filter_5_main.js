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
		this.render();
	}

	function quiz() {
		while (document.body.firstChild) {
			document.body.removeChild(document.body.firstChild)
		}
		let shuffled = [];
		while (users.length > 0) {
			shuffled.push(users.splice(Math.floor(Math.random()*users.length), 1)[0]);
		}
		users = shuffled;
		for (let i=0;i<users.length;i++) {
			users[i].showImage = false;
			users[i].render();
			document.body.appendChild(users[i].div);
		}
	}

	function toggleImage(e) {
		let user = e.target.user;
		user.showImage = !user.showImage;
		user.render();
	};

	function reset(e) {
		let user = e.target.user;
		user.image = null;
		user.word = "";
		user.pool = il.slice();
		user.render();
		user.checkButtons();
		user.keyboard.style.visibility = "visible";
		user.showImage = true;
	}

	function checkButtons() {
		let nextLetters = new Set();
		this.pool.forEach(function (o) {
			let nl = o.text[this.word.length].toLowerCase();
			if (typeof nl !== "undefined") {
				nextLetters.add(nl);
			}
		}.bind(this));
		console.log(nextLetters);
		Array.from(this.keyboard.children).forEach(function (b) {
			b.style.background = "black";
			b.removeEventListener("pointerdown", pointerdownHandler);
			if (
				nextLetters.has(b.innerHTML.toLowerCase())
				) {
				b.style.background = "khaki";
				b.addEventListener("pointerdown", pointerdownHandler);
			}
		});
	}

	function render() {
		this.contextWord.clearRect(0, 0, this.canvasWord.width, this.canvasWord.height);
		this.contextImage.clearRect(0, 0, this.canvasImage.width, this.canvasImage.height);
		fitText(this.contextWord, this.word);
		if (this.image !== null && this.showImage) {
			fitImage(this.contextImage, this.image);
		}
	}

	function pointerdownHandler(e) {
		let user = this.user
		let button = e.target;
		let l = button.value.toLowerCase();
		console.log("pointerdown", l);
		user.word += l.toUpperCase();
		user.pool = filterByCharAtIndex(user.pool, l, user.word.length-1);
		if (user.pool.length === 1) {
			user.image = loader.newImageAsset(user.pool[0].src, onload.bind(user));
			var displayText = user.pool[0].text.toUpperCase()
			//remove period, replace underscore
			displayText = displayText.slice(0, displayText.length-1);
			displayText = displayText.replace(/_/g, " ");
			user.word = displayText;
			user.keyboard.style.visibility = "hidden";
		} else {
			user.checkButtons();
		}
		console.log(user);
		user.render();
	}

	function resize() {
		this.canvasWord.width = this.canvasWord.clientWidth;
		this.canvasWord.height = this.canvasWord.clientHeight;
		this.canvasImage.width = this.canvasImage.clientWidth;
		this.canvasImage.height = this.canvasImage.clientHeight;
		this.render();
	}

	function filterByCharAtIndex(arr, char, index) {
		return arr.filter(function (o) {
			return o.text[index].toLowerCase() == char;
		})
	}
	
	function User() {
		this.checkButtons = checkButtons;
		this.render = render;
		this.onload = onload;
		this.resize = resize;
		this.reset = reset;
		this.div = document.createElement("div");
		this.canvasWord = document.createElement("canvas");
		this.canvasWord.user = this;
		this.canvasWord.addEventListener("pointerdown", toggleImage);
		this.canvasImage = document.createElement("canvas");
		this.contextWord = this.canvasWord.getContext("2d");
		this.contextImage = this.canvasImage.getContext("2d");
		this.keyboard = document.createElement("div");
		this.buttons = Array.from(ABC).forEach(function (letter) {
			let button = document.createElement("button");
			button.value = letter;
			button.user = this;
			button.innerHTML = letter;
			button.classList.add("abc");
			this.keyboard.appendChild(button);
			button.addEventListener("pointerdown", pointerdownHandler);
		}.bind(this));
		this.resetButton = document.createElement("button");
		this.resetButton.user = this;
		this.resetButton.innerHTML = "RESET";
		this.resetButton.addEventListener("pointerdown", reset);
		this.pool = il.slice();
		this.word = "";
		this.image = null;
		this.showImage = true;
		//setup
		this.div.classList.add("user");
		this.canvasWord.classList.add("word");
		this.canvasImage.classList.add("image");
		this.keyboard.classList.add("keyboard");
		this.resetButton.classList.add("reset");
		this.div.appendChild(this.canvasImage);
		this.div.appendChild(this.canvasWord);
		this.div.appendChild(this.keyboard);
		this.div.appendChild(this.resetButton);
		document.body.appendChild(this.div);
	}

	var loader = new Loader("../image_library/images/");
	var ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ_.";
	var again = document.getElementById("again");
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
	
	window.addEventListener("resize", function () {
		users.forEach(function (u) {u.resize();});
	});

	window.addEventListener("keydown", function (e) {
		if (e.key === "q") {
			quiz();
		}
	});

	let users = []
	for (let i=0;i<5;i++) {
		let newUser = new User();
		newUser.resize();
		users.push(newUser);
	}	
});
