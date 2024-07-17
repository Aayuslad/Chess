"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const chess_js_1 = require("chess.js");
const messages_1 = require("./messages");
class Game {
    constructor(player1, blackPlayerName, player2, whitePlayerName) {
        this.blackPlayer = player1;
        this.whitePlayer = player2;
        this.blackPlayerName = blackPlayerName;
        this.whitePlayerName = whitePlayerName;
        this.bord = new chess_js_1.Chess();
        this.startTmime = new Date();
        this.blackPlayer.send(JSON.stringify({
            type: messages_1.INIT_GAME,
            payload: {
                color: "black",
                opponentName: this.whitePlayerName,
                playerName: this.blackPlayerName,
                turn: this.bord.turn(),
            },
        }));
        this.whitePlayer.send(JSON.stringify({
            type: messages_1.INIT_GAME,
            payload: {
                color: "white",
                opponentName: this.blackPlayerName,
                playerName: this.whitePlayerName,
                turn: this.bord.turn(),
            },
        }));
    }
    makeMove(player, move) {
        const turn = this.bord.turn();
        switch (turn) {
            case "w":
                if (player !== this.whitePlayer) {
                    console.log("Error: player is not white player");
                    return;
                }
                break;
            case "b":
                if (player !== this.blackPlayer) {
                    console.log("Error: player is not black player");
                    return;
                }
                break;
            default:
                console.log("Error: player is not white or black player");
                return;
        }
        try {
            this.bord.move({ from: move.from, to: move.to });
            console.log((turn === "w" ? "White player moves " : "Black player moves ") + move.from + " to " + move.to);
        }
        catch (error) {
            console.log("Error in makeMove:" + move.from + " to " + move.to);
            return;
        }
        if (this.bord.isGameOver()) {
            const winner = turn === "w" ? this.whitePlayer : this.blackPlayer;
            this.blackPlayer.emit(messages_1.GAME_OVER, { winner });
            this.whitePlayer.emit(messages_1.GAME_OVER, { winner });
            return;
        }
        this.blackPlayer.send(JSON.stringify({ type: messages_1.MOVE, payload: { move, turn: this.bord.turn() } }));
        this.whitePlayer.send(JSON.stringify({ type: messages_1.MOVE, payload: { move, turn: this.bord.turn() } }));
    }
}
exports.Game = Game;
//        +------------------------+
//      8 | r  n  b  q  k  b  n  r |
//      7 | p  p  p  p  p  p  p  p |
//      6 | .  .  .  .  .  .  .  . |
//      5 | .  .  .  .  .  .  .  . |
//      4 | .  .  .  .  .  .  .  . |
//      3 | .  .  .  .  .  .  .  . |
//      2 | P  P  P  P  P  P  P  P |
//      1 | R  N  B  Q  K  B  N  R |
//        +------------------------+
//          a  b  c  d  e  f  g  h'
