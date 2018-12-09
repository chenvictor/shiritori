const Client = new function() {
    const SSE_URL = "https://shiritori.glitch.me/sse?";

    let SSE = null;
    let lobbyId = null;
    let clientId = null;

    let clientName = null;

    this.init = function(_lobby, _client) {
        lobbyId = _lobby;
        clientId = _client;
        if (SSE !== null) {
            SSE.close();    //Close any previous SSE
        }
        SSE = new EventSource(SSE_URL + "lobbyId=" + lobbyId + "&playerId=" + clientId);
        SSE.onmessage = onSSE;
    };

    let onSSE = function(e) {
        let data = JSON.parse(e.data);
        console.debug("SSE Received: %o", data);
        switch(data.response) {
            case Code.PLAYER.INIT:
                init(data);
                break;
            case Code.BROADCAST.PLAYERS_UPDATED:
                setPlayers(data);
                break;
            case Code.PLAYER.READY_STATE_RECEIVED:
                Interface.setReadyButtonEnabled(true);
                break;
            case Code.BROADCAST.READY_STATE_UPDATED:
                Interface.setReadyStates(data.readyStates);
                break;
            case Code.BROADCAST.GAME_START:
                Interface.gameStart();
                break;
            case Code.BROADCAST.GAME_END:
                Interface.gameEnd();
                break;
            case ShiriCode.PLAYER_TURN:
                Interface.playerTurn(data.player);
                break;
            case ShiriCode.YOUR_TURN:
                let lastWord = data.lastWord;
                Interface.showWordModal(lastWord);
                break;
            case ShiriCode.PLAYER_LOST:
                Interface.playerEliminated(data.player);
                break;
            case ShiriCode.MOVE_MADE:
                Interface.message(data.player + " played the word: " + data.word);
                break;
            case ShiriCode.FEEDBACK:
                CustomAlert.showMessage("You were eliminated! " + data.feedback);
                break;
            case ShiriCode.WINNER:
                CustomAlert.showMessage("The winner is: " + data.winner);
                break;
            default:
                console.error("Received code: " + data.response);
                let main = document.getElementById("main");
                main.classList.remove("visible");
                main.classList.add("invisible");
                console.error("Received error, closing SSE");
                CustomAlert.showMessage("Fatal Error Occurred!");
                SSE.close();
                break;
        }
    };

    let init = (data) => {
        Interface.setLobbyName(data.lobbyName);
        Interface.setPlayerName(data.playerName);
        setPlayers(data);
        Interface.show();
    };

    let setPlayers = (data) => {
        Interface.setPlayers(data.playerList);
    };

    this.readyStateChanged = function(state) {
        ShiriServer.notifyReadyState(lobbyId, clientId, state);
    };

    this.submitWord = function(word) {
        ShiriServer.submitWord(lobbyId, clientId, word);
    }

};