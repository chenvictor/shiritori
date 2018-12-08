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
            case ResponseCode.EVENT.INITIALIZE:
                init(data);
                break;
            case ResponseCode.EVENT.PLAYERS_UPDATED:
                setPlayers(data);
                break;
            case ResponseCode.EVENT.READY_STATE_RECEIVED:
                Interface.setReadyButtonEnabled(true);
                break;
            case ResponseCode.EVENT.READY_STATE_UPDATED:
                Interface.setReadyStates(data.readyStates);
                break;
            case ResponseCode.MISSING.LOBBY:
            case ResponseCode.MISSING.PLAYER:
            case ResponseCode.INVALID.LOBBY_ID:
            case ResponseCode.INVALID.PLAYER_ID:
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

    let readyStateTimeout = null;

    this.readyStateChanged = function(state) {
        if (readyStateTimeout !== null) {
            clearTimeout(readyStateTimeout);
        }
        // Using a timeout to avoid spamming clicks
        readyStateTimeout = setTimeout(() => {
            ShiriServer.notifyReadyState(lobbyId, clientId, state);
        }, 400);
    };

};