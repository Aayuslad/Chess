"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameManager = void 0;
const messages_1 = require("./messages");
const Game_1 = require("./Game");
class GameManager {
    constructor() {
        this.users = [];
        this.pendingUser = undefined;
        this.games = [];
    }
    static getInstance() {
        if (!GameManager.instance) {
            GameManager.instance = new GameManager();
        }
        return GameManager.instance;
    }
    addUser(shocket) {
        this.users.push(shocket);
        this.addhandler(shocket);
    }
    removeUser(shocket) {
        this.users = this.users.filter((user) => user !== shocket);
    }
    addhandler(socket) {
        socket.on("message", (data) => {
            const message = JSON.parse(data.toString());
            console.log("Message received: ", message);
            if (message.type === messages_1.INIT_GAME) {
                if (this.pendingUser) {
                    const game = new Game_1.Game(this.pendingUser.player, this.pendingUser.playerName, socket, message.playerName);
                    this.games.push(game);
                    this.pendingUser = undefined;
                    console.log("New game started : ", game);
                }
                else {
                    this.pendingUser = { player: socket, playerName: message.playerName };
                }
            }
            if (message.type === messages_1.MOVE) {
                const game = this.games.find((game) => game.whitePlayer === socket || game.blackPlayer === socket);
                if (game) {
                    game.makeMove(socket, message.move);
                }
            }
        });
    }
}
exports.GameManager = GameManager;
