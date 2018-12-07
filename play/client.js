const Client = new function() {
    const SSE_URL = "https://shiritori.glitch.me/sse?";

    const CODE_INIT = 400;
    const CODE_MISS_LOBBY = 100;
    const CODE_MISS_PLAYER = 101;
    const CODE_INVALID_LOBBY = 200;
    const CODE_INVALID_PLAYER = 201;

    const CODE_PLAYERS_CHANGED = 401;

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
        SSE.onopen = function(e) {
            console.debug("SSE attached");

            let main = document.getElementById("main");
            main.classList.remove("invisible");
            main.classList.add("visible");
        };
        SSE.onerror = function(e) {
            console.debug("SSE Error, detached");
        }
    };

    let onSSE = function(e) {
        let data = JSON.parse(e.data);
        console.debug("SSE Received: %o", data);
        switch(data.response) {
            case CODE_INIT:
                init(data);
                break;
            case CODE_PLAYERS_CHANGED:
                setPlayers(data);
                break;
            case CODE_MISS_LOBBY:
            case CODE_MISS_PLAYER:
            case CODE_INVALID_LOBBY:
            case CODE_INVALID_PLAYER:

                let main = document.getElementById("main");
                main.classList.remove("visible");
                main.classList.add("invisible");

                SSE.close();
                console.error("Received error, closing SSE");
                CustomAlert.showMessage("Fatal Error Occurred!");
                break;
        }
    };

    let init = (data) => {
        let lobbyName = document.getElementById("lobbyName");
        // noinspection JSUnresolvedVariable
        lobbyName.innerHTML = data.lobbyName;
        let displayName = document.getElementById("displayName");
        displayName.innerHTML = data.playerName;
        clientName = data.playerName;
        setPlayers(data);
    };

    let setPlayers = (data) => {
        let listDiv = document.getElementById("playerList");
        listDiv.innerHTML = ""; //Empties list
        let players = data.playerList;
        for (let i = 0; i < players.length; i++) {
            let p = players[i];
            let item = document.createElement("li");
            item.classList.add("list-group-item");
            item.innerHTML = p;
            if (p === clientName) {
                item.innerHTML = "[" + item.innerHTML + "]";
            }
            listDiv.appendChild(item);
        }
        let countDiv = document.getElementById("playerCount");
        countDiv.innerHTML = players.length;
    }

};