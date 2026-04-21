import image_library from "./image_library/image_library.mjs"
const KEYS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]

function letterPointerdownHandler() {
	this.player.divWord += this.value;
	this.player.update();
	this.player.showImage();
}

function textareaInputHandler() {
	this.player.update();
	this.player.showImage();
}

function playerCountChange(num) {
	playerCount = num;
	console.log("NUM", num);
	localStorage.setItem("players", num);
	console.log("SETITEM", playerCount, "players", localStorage.getItem("players"));
	players.forEach(function (p, index) {
		if (parseInt(p.radio.value) > playerCount) {
			p.div.style.display = "none";
		} else {
			if (index == num - 1) {
				p.radio.checked = true;
			}
			p.div.style.display = "flex";
		}
	});
}

function newKey(letter_uppercase, value, gridArea, player) {
		let button = document.createElement("button");
		button.classList.add("key");
		button.innerHTML = letter_uppercase;
		button.value = value;
		button.addEventListener("pointerdown", letterPointerdownHandler);
		button.style.gridArea = gridArea;
		button.player = player;
		button.tabIndex = "-1";
		return button;
}

function Player() {
	this.update = function () {
		//find matches that start with the entered text
		let pool = image_library.filter(function (o) {
			return o.text.toUpperCase().startsWith(this.divWord.value.toUpperCase());
		}.bind(this));
		console.log(pool);
		if (pool.length > 1) {
			this.buttonOK.disabled = true;
			while (this.divImage.firstChild) {
				this.divImage.removeChild(this.divImage.firstChild);
			}
			this.divImage.style.display = "none";
			this.divMatches.style.display = "";
			//update possible matches
			while(this.divMatches.firstChild) {
				this.divMatches.removeChild(this.divMatches.firstChild);
			}
			if (this.divWord.value.length > 0) {
				pool.forEach(function (match) {
					let button = document.createElement("button");
					button.classList.add("match");
					//disambiguation
					if (pool.filter(ilo => ilo.text === match.text).length === 1) {
						button.innerHTML = match.text;
					} else {
						button.innerHTML = match.text + " (" + match.tags[0].replace("_", " ") + ")";
					}
					button.tabIndex = "-1";
					button.ilo = match;
					button.addEventListener("click", function (ev) {
						let ilo = ev.target.ilo;
						let img = document.createElement("img");
						this.ilo = ilo;
						img.src = "image_library/images/"+ilo.src;
						this.divImage.appendChild(img);
						this.divImage.style.display = "";
						this.showImage();
						this.divMatches.style.display = "none";
						this.divKeyboard.style.display = "none";
						this.buttonReset.style.display = "flex";
						this.divWord.value = ilo.text.toUpperCase();
					}.bind(this));
					this.divMatches.appendChild(button);
				}.bind(this));
			}
			this.divWord.value = this.divWord.value.toUpperCase();
			//hide letters with no matches
			let nextLetters = new Set();
			pool.forEach(function (o) {
				//if there is an exact match, enable OK button
				if (o.text.toUpperCase() === this.divWord.value.toUpperCase()) {
					this.buttonOK.disabled = false;
				}
				let nl = o.text[this.divWord.value.length];
				if (typeof nl !== "undefined") {
					nextLetters.add(nl.toLowerCase());
				}
			}.bind(this));
			Array.from(this.divKeyboard.children).filter(el => Array.from(el.classList).includes("letterKey")).forEach(function (b) {
				b.style.visibility = "hidden";
				//b.removeEventListener("click", clickHandler);
				if (
					nextLetters.has(b.value)
				) {
					b.style.visibility = "visible";
					//b.addEventListener("click", clickHandler);
				}
			});
		} else if (pool.length === 1) {
			//autocomplete
			if (this.ilo === null) {
				console.log("ONLY", pool[0].text, "REMAINS");
				this.ilo = pool[0];
				this.divKeyboard.style.display = "none";
				this.buttonReset.style.display = "flex";
				this.divWord.value = this.ilo.text.toUpperCase();
				let img = document.createElement("img");
				img.src = "image_library/images/"+this.ilo.src;
				this.divImage.appendChild(img);
				this.divImage.style.display = "";
				this.divMatches.style.display = "none";
			}
		} else {
			while (pool.length === 0 && this.divWord.value.length > 0) {
				pool = image_library.filter(function (o) {
					return o.text.toUpperCase().startsWith(this.divWord.value.toUpperCase());
				}.bind(this));
				console.log("WORD", this.divWord.value);
				this.divWord.value = this.divWord.value.slice(0, -1);
			}
		}
	}
	this.showImage = function () {
		this.divImage.style.opacity = "1";
		this.isImageHidden = false;
	}
	this.hideImage = function () {
		this.divImage.style.opacity = "0";
		this.isImageHidden = true;
	}
	this.toggleImage = function () {
		if (this.isImageHidden) {
			this.divImage.style.opacity = "1";
			this.isImageHidden = false;
		} else {
			this.divImage.style.opacity = "0";
			this.isImageHidden = true;
		}
	}
	this.isImageHidden = false;
	this.div = document.createElement("div");
	this.div.classList.add("player");
	this.divImage = document.createElement("div");
	this.divImage.classList.add("image_library");
	this.divImage.style.display = "none";
	this.divImage.addEventListener("pointerdown", function () {
		console.log("hide or show image");
		this.toggleImage();
	}.bind(this));
	this.divMatches = document.createElement("div");
	this.divMatches.classList.add("matches");
	this.divWord = document.createElement("textarea");
	this.divWord.addEventListener("input", textareaInputHandler);
	this.divWord.rows = 2;
	this.divWord.classList.add("word");
	this.divWord.player = this;
	this.divWord.addEventListener("keydown", function (ev) {
		if (ev.key === "Escape") {
			this.buttonReset.click();
		}
		if (ev.key === "Enter") {
			ev.preventDefault();
			this.buttonOK.click();
		}
		if (ev.key === "Backspace") {
			ev.preventDefault();
			let searchTerm = this.divWord.value;
			let pool = image_library.filter(function (o) {
				return o.text.toUpperCase().startsWith(searchTerm.toUpperCase());
			}.bind(this));
			let prevLength = pool.length;
			while (pool.length === prevLength && searchTerm.length > 0) {
				searchTerm = searchTerm.slice(0, -1);
				pool = image_library.filter(function (o) {
					return o.text.toUpperCase().startsWith(searchTerm.toUpperCase());
				}.bind(this));
				console.log("WORD", searchTerm, pool);
			}
			if (this.divImage.firstChild) {
				this.divImage.removeChild(this.divImage.firstChild);
			}
			this.buttonReset.style.display = "none";
			this.divKeyboard.style.display = "grid";
			this.update();
		}
	}.bind(this));
	this.divKeyboard = document.createElement("div");
	this.divKeyboard.classList.add("keyboard");
	this.buttonReset = document.createElement("button");
	this.buttonReset.id = "buttonReset";
	this.buttonReset.style.display = "none";
	this.buttonReset.innerHTML = "Reset";
	this.buttonReset.player = this;
	this.buttonReset.tabIndex = "-1";
	this.buttonReset.addEventListener("click", function () {
		this.style.display = "none";
		this.player.divKeyboard.style.display = "grid";
		this.player.divWord.value = "";
		this.player.update();
		this.player.buttonOK.disabled = true; 
		if (this.player.divImage.firstChild) {
			this.player.divImage.removeChild(this.player.divImage.firstChild);
		}
		Array.from(this.player.divKeyboard.children).filter(el => Array.from(el.classList).includes("letterKey")).forEach(function (b) {
			b.style.visibility = "visible";
		});
		let bsp = document.getElementById("buttonSpace").style.visibility = "hidden";
	});
	this.ilo = null;
	this.keys = [];

	//Alphabet Keys
	KEYS.forEach(function (letter_uppercase) {
		let letter_lowercase = letter_uppercase.toLowerCase();
		let button = new newKey(letter_uppercase, letter_lowercase, letter_lowercase, this);
		button.classList.add("letterKey");
		this.divKeyboard.appendChild(button);
	}.bind(this));

	//Special Keys
	let buttonPeriod = new newKey(".", ".", "period", this);
	buttonPeriod.classList.add("letterKey");
	buttonPeriod.id = "buttonPeriod";
	this.divKeyboard.appendChild(buttonPeriod);

	let buttonSpace = new newKey(" ", " ", "space", this);
	buttonSpace.classList.add("letterKey");
	buttonSpace.id = "buttonSpace";
	buttonSpace.style.visibility = "hidden";
	this.divKeyboard.appendChild(buttonSpace);

	let buttonOK = new newKey("OK", "OK", "ok", this);
	buttonOK.id = "buttonOK";
	buttonOK.disabled = true;
	buttonOK.removeEventListener("pointerdown", letterPointerdownHandler);
	buttonOK.addEventListener("click", function () {
		let choice = image_library.find(function (o) {
			return o.text.toUpperCase() === this.divWord.value.toUpperCase()
		}.bind(this.player));
		let img = document.createElement("img");
		img.src = "image_library/images/"+choice.src;
		this.player.divImage.appendChild(img);
		this.player.divImage.style.display = "";
		this.player.showImage();
		this.player.divMatches.style.display = "none";
		this.player.divKeyboard.style.display = "none";
		this.player.buttonReset.style.display = "flex";
		this.player.divWord.innerHTML = choice.text.toUpperCase();
		console.log(this.player.divWord.value, "chosen", choice);
		console.log(this.player.divImage, "DIVIMAGE", img);
	});
	this.buttonOK = buttonOK;
	this.divKeyboard.appendChild(buttonOK);

	let buttonBS = new newKey("&larr;BS", "BS", "bs", this);
	buttonBS.removeEventListener("pointerdown", letterPointerdownHandler);
	buttonBS.addEventListener("pointerdown", function () {
		this.player.divWord.value = this.player.divWord.value.slice(0, -1);
		this.player.update();
	});
	buttonBS.classList.add("key");
	buttonBS.classList.add("buttonBackSpace");
	this.divKeyboard.appendChild(buttonBS);

	this.div.appendChild(this.divWord);
	this.div.appendChild(this.divImage);
	this.div.appendChild(this.divMatches);
	this.div.appendChild(this.divKeyboard);
	this.div.appendChild(this.buttonReset);
}

let playerCount = localStorage.getItem("players");
if (playerCount === null) {playerCount = 1;}
console.log("PC", localStorage.getItem("players"), playerCount);
let players = [
]
let divPlayers = document.getElementById("players");

let buttonQuiz = document.getElementById("buttonQuiz");
buttonQuiz.addEventListener("pointerdown", function () {
	console.log("QUIZ TIME");
	let tmp = [];
	while (players.length > 0) {
		let randomIndex = Math.floor(Math.random()*players.length);
		let player = players.splice(randomIndex, 1)[0];
		tmp.push(player);
	}
	players = tmp;
	//hide all images
	players.forEach(function (p) {
		p.hideImage();
	});
	//repopulate div players
	while (divPlayers.firstChild) {
		divPlayers.removeChild(divPlayers.firstChild);
	}
	for (let i=0;i<tmp.length;i++) {
		divPlayers.appendChild(tmp[i].div);
	}
});
for (let i=0; i<5; i++) {
	console.log(i);
	let player = new Player();
	let radio = document.createElement("input");
	let label = document.createElement("label");
	radio.id = "radio"+i;
	radio.type = "radio";
	radio.name = "numberOfPlayers";
	radio.value = i+1;
	radio.addEventListener("click", function (el) {
		console.log("CHANGE PLAYER COUNT TO", el.target.value);
		playerCountChange(el.target.value);
	});
	label.innerHTML = i+1;
	label.htmlFor = radio.id;
	player.radio = radio;
	player.radioLabel = label;
	player.div.style.display = "none";
	divPlayers.appendChild(player.div);
	document.getElementById("divSetPlayerNumber").appendChild(radio);
	document.getElementById("divSetPlayerNumber").appendChild(label);
	players.push(player);
}
playerCountChange(playerCount);
