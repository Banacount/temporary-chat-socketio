
const userNameInput = document.getElementById("userNameInput");
const generateTempLobby = document.getElementById("generateTempLobby");
const gotoGlobalLobby = document.getElementById("gotoGlobalLobby");
const generatedLink = document.getElementById("generatedLink");

userNameInput.addEventListener('input', () => 
{
	saveUsername(userNameInput.value);
});

gotoGlobalLobby.addEventListener('click', () => 
{
	// Go to chats route
	window.location = "/chats";
});

generateTempLobby.addEventListener('click', async () => 
{
	let lobby_name = prompt("Enter the desired lobby name: ");

	if (lobby_name != null) {
		if (lobby_name.trim() == "") 
			alert("Invalid lobby name.");
		else {
			try {
				const requestLobbyLink = encodeURI(`/chats/new/${lobby_name}`);
				const response = await fetch(requestLobbyLink);

				if (!response.ok) throw Error('Error in receiving the data.');

				// { message: [server message], link: [lobby generated link] }
				const data = await response.json();

				let isLink = false;
				generatedLink.style.display = 'flex';

				if (data.link) {
					generatedLink.textContent = data.link;
					isLink = true;
				} else
					generatedLink.textContent = data.message;

				generatedLink.addEventListener('click', () => {
					if (!isLink) return;
					alert('Copied the link.')
					navigator.clipboard.writeText(data.link);
				});
			} catch (error) {
				console.error('Error:', error);
			}
		}
	}
});


userNameInput.value = loadUsername();
