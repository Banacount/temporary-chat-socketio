import { randomUUID } from "crypto";
import { lobbies, tempChat } from "../index.js";
import { ChatService } from "../services/chat.service.js";

export const createTemporaryLobby = (req, res) => {
    const lobby_name = req.params.name;
    const lobby_id = randomUUID().replace(/-/g, "");

    if (lobby_name && lobby_name.trim() != "") {
        // Check if a lobby name already exists
        let nameIsActive = false;
        // for (const key in temporaryLobbies) {
        for (const [_, lobby] of lobbies) {
            if (lobby.lobby_name == lobby_name) nameIsActive = true;
        }

        // if lobby name already existed, send an error message
        if (nameIsActive) {
            res.status(500).json({ message: "Lobby name already exists." });
            return;
        }

        // create the lobby chat object (temporary lobby, this will be deleted after a specific time)
        const tempLobby = new ChatService(tempChat, lobby_name, lobby_id, true);

        // set the isTemporary callback to this function delete the chat object from temporaryLobbies object
        tempLobby.killAfterExpiration((id) => {
            lobbies.delete(id);
            console.log(`Killing temporary lobby '${id}'.`);
        });

        // assign the lobby `Chat` object to its lobby id in temporaryLobbies object
        // temporaryLobbies[lobby_id] = tempLobby;
        lobbies.set(lobby_id, {
            isTemporary: true,
            lobby_name: lobby_name,
            chatService: tempLobby,
        });

        console.log(lobbies);

        res.status(200).json({
            message: `Lobby '${lobby_name}' has been created`,
            link: `http://localhost:2025/temp_chats?lobby=${lobby_id}`,
        });
    } else {
        res.status(500).json({ message: "Cannot create a lobby." });
    }
};
