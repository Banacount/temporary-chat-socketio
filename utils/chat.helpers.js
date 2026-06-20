import { Chat } from "../models/chat.model.js";
import { lobbies } from "../index.js";
// import { ChatService } from "../services/chat.service";

/**
 *
 * @param {*} socket
 * @desc  check if lobby exists, then return its chat service object. query.lobby returns the UUID and the key of our lobbies Map is the UUID generated also.
 * @returns {ChatService}
 */
export const returnLobbyBaseOnId = (socket, isTemporary) => {
    try {
        const query = socket.handshake.query;
        let lobby_index;

        // look for ?=lobby queries
        // if found something then set it as the lobby_index.
        // if nothing is found and this is not temporary, then it means the lobby is global (GET /chats)

        if (query.lobby != "null" && lobbies.has(query.lobby)) {
            // look for any lobby query.
            lobby_index = query.lobby;
        } else if (!lobby_index && !isTemporary) {
            // if nothing is found and this is not temporary, then it means the user is in global
            lobby_index = "global";
        } else {
            // else, if
            cannotFindLobby(socket);
            return null;
        }
        const chatService = lobbies.get(lobby_index).chatService;
        return chatService;
    } catch (error) {
        // in case if any error happens, return cannot find lobby
        cannotFindLobby(socket);
        return null;
    }
};

// this is repeated multiple times, so make it as a function
const cannotFindLobby = (socket) => {
    let chat = new Chat(
        "server_67",
        "This lobby doesn't seem to exist",
        "admin",
    );

    socket.emit("message_update", [chat]);
};
