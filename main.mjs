import image_library from "./image_library/image_library.mjs"
const KEYS = ["Aa", "Bb", "Cc", "Dd", "Ee", "Ff", "Gg", "Hh", "Ii", "Jj", "Kk", "Ll", "Mm", "Nn", "Oo", "Pp", "Qq", "Rr", "Ss", "Tt", "Uu", "Vv", "Ww", "Xx", "Yy", "Zz"]

function updateKeyboard(testString) {
	let p = this.player;
	let pool = [];
	//allow only one single entry per text
	pool.push(image_library[0]);
	image_library.forEach(function (o) {
		let sameText = image_library.filter(o2 => o.text === o2.text);
		if (sameText.length > 1) {
			//check that we don't already have one
			if (pool.filter(o3 => o3.text === sameText[0].text).length === 0) {
				pool.push(sameText[Math.floor(Math.random()*sameText.length)]);
			}
		} else {
			pool.push(sameText[0]);
		}
	});
	p.buttonOK.disabled = true;
	//array of words that match
	pool = pool.filter(function (o) {
		return o.text.slice(0, testString.length).toLowerCase() === testString;
	})
	//if there are matches, letter to word
	if (pool.length > 1) {
		p.word = testString;
		p.divWord.innerHTML = p.word.toUpperCase();
		//hide letters with no matches
		let nextLetters = new Set();
		pool.forEach(function (o) {
			//if there is an exact match, enable OK button
			if (testString === o.text) {
				p.buttonOK.disabled = false;
			}
			let nl = o.text[p.word.length];
			if (typeof nl !== "undefined") {
				nextLetters.add(nl.toLowerCase());
			}
		});
		Array.from(p.divKeyboard.children).filter(el => Array.from(el.classList).includes("letterKey")).forEach(function (b) {
			b.style.visibility = "hidden";
			//b.removeEventListener("click", clickHandler);
			if (
				nextLetters.has(b.value)
			) {
				b.style.visibility = "visible";
				//b.addEventListener("click", clickHandler);
			}
		});
	} else {
		//autocomplete
		console.log("ONLY", pool[0].text, "REMAINS");
		//Array.from(p.divKeyboard.children).forEach(el => el.style.visibility = "hidden");
		p.divKeyboard.style.display = "none";
		p.buttonReset.style.display = "flex";
		p.divWord.innerHTML = pool[0].text.toUpperCase();
		let img = document.createElement("img");
		img.src = "image_library/images/"+pool[0].src;
		p.divImage.appendChild(img);
	}
}

function letterPointerdownHandler() {
	let ll = this.value;
	let testString = this.player.word+ll;
	updateKeyboard.bind(this)(testString);
}

function newKey(Kk, value, gridArea, player) {
		let button = document.createElement("button");
		button.classList.add("key");
		button.innerHTML = Kk;
		button.value = value;
		button.addEventListener("pointerdown", letterPointerdownHandler);
		button.style.gridArea = gridArea;
		button.player = player;
		return button;
}

function Player() {
	this.div = document.createElement("div");
	this.div.classList.add("player");
	this.divImage = document.createElement("div");
	this.divImage.classList.add("image_library");
	this.divWord = document.createElement("div");
	this.divWord.classList.add("word");
	this.divKeyboard = document.createElement("div");
	this.divKeyboard.classList.add("keyboard");
	this.buttonReset = document.createElement("button");
	this.buttonReset.id = "buttonReset";
	this.buttonReset.style.display = "none";
	this.buttonReset.innerHTML = "Reset";
	this.buttonReset.player = this;
	console.log(this.buttonReset.player);
	this.buttonReset.addEventListener("pointerdown", function () {
		this.style.display = "none";
		this.player.divKeyboard.style.display = "grid";
		this.player.word = "";
		this.player.divWord.innerHTML = "";
		this.player.divImage.removeChild(this.player.divImage.firstChild);
		Array.from(this.player.divKeyboard.children).filter(el => Array.from(el.classList).includes("letterKey")).forEach(function (b) {
			b.style.visibility = "visible";
		});
		let bsp = document.getElementById("buttonSpace").style.visibility = "hidden";
	});
	this.word = "";
	this.keys = [];

	//Alphabet Keys
	KEYS.forEach(function (Kk) {
		let button = new newKey(Kk, Kk[1], Kk[1], this);
		button.classList.add("letterKey");
		this.divKeyboard.appendChild(button);
	}.bind(this));

	//Special Keys
	let buttonSpace = new newKey(" ", " ", "space", this);
	buttonSpace.classList.add("letterKey");
	buttonSpace.id = "buttonSpace";
	buttonSpace.style.visibility = "hidden";
	this.divKeyboard.appendChild(buttonSpace);

	let buttonOK = new newKey("OK", "OK", "ok", this);
	buttonOK.disabled = true;
	buttonOK.removeEventListener("pointerdown", letterPointerdownHandler);
	buttonOK.addEventListener("pointerdown", function () {
		let choices = image_library.filter(o => o.text === this.player.word);
		let choice = choices[Math.floor(Math.random()*choices.length)];
		let img = document.createElement("img");
		img.src = "image_library/images/"+choice.src;
		this.player.divImage.appendChild(img);
		this.player.divKeyboard.style.display = "none";
		this.player.buttonReset.style.display = "flex";
		this.player.divWord.innerHTML = choice.text.toUpperCase();
		console.log(this.player.word, "chosen", choice);
	});
	this.buttonOK = buttonOK;
	this.divKeyboard.appendChild(buttonOK);

	let buttonBS = new newKey("Back<br>Space", "BS", "bs", this);
	buttonBS.removeEventListener("pointerdown", letterPointerdownHandler);
	buttonBS.addEventListener("pointerdown", function () {
		this.player.word = this.player.word.slice(0, -1);
		updateKeyboard.bind(this)(this.player.word);
	});
	buttonBS.style.fontSize = "3vh";
	buttonBS.style.background = "red";
	this.divKeyboard.appendChild(buttonBS);

	this.div.appendChild(this.divImage);
	this.div.appendChild(this.divWord);
	this.div.appendChild(this.divKeyboard);
	this.div.appendChild(this.buttonReset);
}

let p1 = new Player();
document.getElementById("players").appendChild(p1.div);
