import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";
import { Chat } from "./models/chat.model.js";
import { ChatService } from "./services/chat.service.js";
import chatRoutes from "./routes/chat.routes.js";
import { generateUsername } from "./utils/helpers.js";
import { returnLobbyBaseOnId } from "./utils/chat.helpers.js";

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

/**
 * io.of -> split a single physical WebSocket connection into multiple isolated communication channels over the same server port
 */
export const mainChat = io.of("/chats");
export const tempChat = io.of("/temp_chats");

/**
 * @typedef {Object} LobbyMap
 * @property {ChatService} global
 */

/** @type {LobbyMap} */

/** @type {LobbyMap} */
// ! REFACTOR: since these two objects are doing identical operations, we will just make them into a single data structure.
// const permanentLobbies = {
//     global: new ChatService(mainChat, "Global center", "global"),
//     chat_1: new ChatService(mainChat, "Joe's nutsack", "global"),
//     chat_2: new ChatService(mainChat, "Joe's floorboards", "global"),
// };

/*
 * lobbies map
 * sample contents (key: lobby_id)
 * ->
 *   -   lobby_name
 *   -   isTemporary
 *   -   io (chat service) ?
 *   -   expirationTime ?
 */
export const lobbies = new Map();

// SET GLOBAL LOBBIES
lobbies.set("global", {
    lobby_name: "Global Center",
    isTemporary: false,
    chatService: new ChatService(mainChat, "Global center", "global"),
});
lobbies.set("chat_1", {
    lobby_name: "Joe's nutsack",
    isTemporary: false,
    chatService: new ChatService(mainChat, "Joe's nutsack", "global"),
});
lobbies.set("chat_2", {
    lobby_name: "Joe's floorboards",
    isTemporary: false,
    chatService: new ChatService(mainChat, "Joe's floorboards", "global"),
});
// console.log(lobbies);
// App setup
app.set("view engine", "ejs");
app.use(express.static("static"));

// --------- Paths
app.get("/", (req, res) => {
    res.send(`
        <a class="link-button lobby-link" href="/chats">Go to Global</a>
    `);
});

/*
Routes ->
    /chats
    /chats/new/:name
    /chats/killed
    /chats/temp_chats
*/
app.use("/chats", chatRoutes);

// --------- End Paths

// Server things
const port = 2025;
server.listen(port, () => {
    console.log("Server is running:");
    console.log(`http://localhost:${port}`);
});

// The permanent chat lobbies.
mainChat.on("connection", (sock) => {
    const query = sock.handshake.query;
    let lobby_index = "global";

    /*
     *   check if the parameter: ?lobby= is not null and the lobby query --
     *   exists in the permanentLobbies
     */
    // Filter each socket request to specific lobbies.
    /** @type {ChatService} */
    const chatService = returnLobbyBaseOnId(sock);

    if (!chatService) {
        console.log("none");
        return;
    }

    let getUsername;

    if (query.username != "null") getUsername = query.username;
    else getUsername = generateUsername(); // if a client joined, then

    chatService.addUser(sock.id, getUsername);
    chatService.lobbyAnnounce(
        `New user has arrived '${chatService.getUser(sock.id)}'.`,
    );

    sock.emit("init_connection", { id: sock.id });

    // Receive messages from clients
    sock.on("msg", (data) => {
        // chatService.clearChats();

        // Rules
        if ([...data].length >= 500) {
            chatService.lobbyAnnounce(
                `${chatService.getUser(sock.id)} too long of a message man...`,
            );
            return;
        }
        let p1 = data.trim();
        // if message is empty, then don't proceed
        if (p1 == "") return;

        let chat = new Chat(chatService.getUser(sock.id), data, sock.id);

        chatService.addToGlobalChats(chat);
        chatService.updateMessages();
    });

    // Announce disconnected clients
    sock.on("disconnect", () => {
        chatService.clearChats();
        chatService.disconnect(sock.id);
    });
});

// The temporary chats lobbies.
tempChat.on("connection", (sock) => {
    /*
    * get queries from the frontend
    * sample ->
    *
    * query:
        username: urlParams.get("username"),
        lobby: urlParams.get("lobby")
    */

    // Filter each socket request to specific lobbies.
    /** @type {ChatService} */
    const chatService = returnLobbyBaseOnId(sock);

    if (!chatService) return;

    chatService.clearChats();
    let getUsername;

    if (query.username != "null") getUsername = query.username;
    else getUsername = generateUsername(); // if a client joined, then

    chatService.addUser(sock.id, getUsername);
    chatService.lobbyAnnounce(
        `New user has arrived '${chatService._users[sock.id]}'.`,
    );

    sock.emit("init_connection", { id: sock.id });

    // Receive messages from clients
    sock.on("msg", (data) => {
        chatService.clearChats();

        // Rules
        if ([...data].length >= 500) {
            chatService.lobbyAnnounce(
                `${chatService.getUser(sock.id)} too long of a message man...`,
            );
            return;
        }
        let p1 = data.trim();
        if (p1 == "") return;

        // ! REFACTOR THIS
        let chat = new Chat(chatService.getUser(sock.id), data, sock.id);

        // TODO: seperate this in a method
        chatService.addToGlobalChats(chat);
        chatService.updateMessages();
    });

    // Announce disconnected clients
    sock.on("disconnect", () => {
        chatService.clearChats();
        chatService.disconnect(sock.id);
    });
});

// Socket handle for each client
//io.on("connection", (sock) => {
//});
