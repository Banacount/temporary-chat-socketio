const USERNAME_LOCAL = "username";

/** @param {String} name*/
function saveUsername (name) {
	localStorage.setItem(USERNAME_LOCAL, name);
};

/** @returns {String}*/
function loadUsername () {
	let getUser = localStorage.getItem(USERNAME_LOCAL);

	if (getUser == null) {
		saveUsername("");
		getUser = "";
	}

	return getUser;
};

window.loadUsername = loadUsername;
window.saveUsername = saveUsername;
