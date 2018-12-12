const QuickLobby = new function() {

    // Set the request and SSE urls of the server
    const REQUEST_URL   =   "https://majestic-laundry.glitch.me/lobby";
    const SSE_URL       =   "https://majestic-laundry.glitch.me/sse";

    /**
     * Request and Response codes used to communicate with the server
     */
    this.CODE = {
        REQ: {
            CREATE:     0,  //  Create a lobby
            CHECK:      1,  //  Check lobby info
            JOIN:       2,  //  Join a lobby (Create a player/client)
            READY:      3,  //  Change the player's ready status
            CUSTOM:     4,  //  Custom request
        },
        RES: {
            SUCCESS:    0,   //Generic Success
            FAIL:       1,   //Generic Fail

            LOBBY_DNE:  3,   // Lobby doesn't exist
            PLAYER_DNE: 4,   // Player doesn't exist

            CREATE: {
                LOBBIES_FULL:   100,    // Failed to create because lobbies are full
                NAME_INVALID:   101,    // Failed to create because the name was invalid
                PASS_INVALID:   102,    // Failed to create because the password was invalid
            },
            JOIN: {
                LOBBY_FULL:     301,    // Failed to join because lobby is already full
                LOBBY_STARTED:  302,    // Failed to join because lobby has already started
                PASS_WRONG:     303,    // Failed to join because password supplied was incorrect
                NAME_INVALID:   304,    // Failed to join because name supplied was invalid
                NAME_IN_USE:    305,    // Failed to join because name supplied is already in use
            },
        },
        SSE: {
            INVALID_LOBBY:      700,    // Failed to attach SSE because lobbyId was invalid
            INVALID_PLAYER:     701,    // Failed to attach SSE because playerId was invalid

            PLAYER_JOINED:      800,    // A player joined the lobby
            PLAYER_LEFT:        801,    // A player left the lobby
            INIT:               802,    // Initial SSE message
            READY_UPDATED:      803,    // Player ready states have changed
            LOBBY_STARTED:      804,    // Lobby started, (all players ready, game starts)
            LOBBY_ENDED:        805,    // Lobby ended, (after a game completes)

            CUSTOM:             899,    // Custom message received
        },
        // Relevant to client side
        XHR: {
            FAIL:       -1,     // XHR failed
            TIMEOUT:    -2,     // XHR timed out
        }
    };

    //Verbose will print more log messages
    let v = (msg, ...args) => {
        // Uncomment to enable verbose
        console.log("[QuickLobby]: " + msg, ...args);
    };

    /**
     * Request a lobby from the server
     * @param lobbyName     name for the lobby
     * @param lobbyPass     password for the lobby, or false if no password desired
     * @returns {Promise}       resolve:    the lobbyID of the new lobby.
     *                          reject:     the error code received.
     */
    this.requestLobby = function(lobbyName, lobbyPass) {
        v("Requesting lobby\nname:\t%s\npass:\t%s", lobbyName, lobbyPass);
        return sendXHR({
            request: this.CODE.REQ.CREATE,
            name: lobbyName,
            pass: lobbyPass,
        });
    };

    this.checkLobby = function(lobbyId) {
        v("Checking lobby\nlobbyId:\t%s", lobbyId);
        return sendXHR({
            request:    this.CODE.REQ.CHECK,
            lobbyId:    lobbyId,
        });
    };

    this.joinLobby = function(lobbyId, password, playerName) {
        v("Requesting client\nlobbyId:\t%s\npassword:\t%s\nplayerName:\t%s", lobbyId, password, playerName);
        return new Promise((resolve, reject) => {
            sendXHR({
                request:    this.CODE.REQ.JOIN,
                lobbyId:    lobbyId,
                password:   password,
                playerName: playerName,
            }).then((data) => {
                console.log(data);
                resolve(new QuickClient(lobbyId, data));
            }).catch(reject);
        });
    };

    /**
     * Opens and sends an XHR to the server
     * @param data      json data to send
     * @returns {Promise}       resolve:    the data received
     *                          reject:     the error code
     */
    let sendXHR = (data) => {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.open('POST', REQUEST_URL);
            xhr.setRequestHeader('Accept',          '*/*');
            xhr.setRequestHeader('Content-Type',    'application/json');
            xhr.onload = () => {
                v("XHR Loaded: %d - %s", xhr.status, xhr.responseText);
                if (xhr.status === 200) {
                    let json = JSON.parse(xhr.responseText);
                    if (json.response === this.CODE.RES.SUCCESS) {
                        resolve(json.data);
                    } else {
                        reject(json.response);
                    }
                } else {
                    reject(this.CODE.XHR.FAIL);
                }
            };
            xhr.onerror = () => {
                v("XHR failed");
                reject(this.CODE.XHR.FAIL);
            };
            xhr.timeout = 4000;
            xhr.ontimeout = () => {
                v("XHR timed out");
                reject(this.CODE.XHR.TIMEOUT);
            };
            xhr.send(JSON.stringify(data));
        });

    };


    /**
     * A quick client instance
     * @param lobbyId       lobbyId
     * @param clientId      clientId
     * @constructor
     */
    function QuickClient(lobbyId, clientId) {
        const lobby = lobbyId;
        const client = clientId;

        let playerName;
        let lobbyName;

        let sse;
        let eventCalls = {
            init:               (client) => {},
            player_join:        (client, name) => {},
            player_leave:       (client, name) => {},
            players_changed:    (client, nameList, readyList) => {},
            ready_changed:      (client, readyList) => {},
            lobby_start:        (client) => {},
            lobby_end:          (client) => {},
            error:              (client, errorCode, message) => {},
            custom:             (client, data) => {},
        };

        this.getPlayerName = function() {
            return playerName;
        };

        this.getLobbyName = function() {
            return lobbyName;
        };

        this.notifyReadyState = function(state) {
            return sendXHR({
                request:    QuickLobby.CODE.REQ.READY,
                lobbyId:    lobby,
                clientId:   client,
                ready:      state,
            });
        };

        this.sendCustom = function(data) {
            return sendXHR({
                request:    QuickLobby.CODE.REQ.CUSTOM,
                lobbyId:    lobby,
                clientId:   client,
                data:       data,
            });
        };

        /**
         * Closes the SSE connection to the server
         */
        this.close = function() {
            v("Closing SSE Connection of client\nclientId:\t%s", client);
            sse.close();
        };

        /**
         * Attach an event handler to the client
         * @param event     event to handle
         * @param callback  callback to call
         */
        this.on = function(event, callback) {
            if (event in eventCalls) {
                eventCalls[event] = callback;
            } else {
                console.warn("Trying to register and invalid event: %s", event);
            }
            return this;
        };

        let handleSSE = (e) => {
            let data = JSON.parse(e.data);
            v("SSE Received: %o", data);
            switch (data.response) {
                case QuickLobby.CODE.SSE.INIT:
                    lobbyName = data.lobbyName;
                    playerName = data.playerName;
                    eventCalls.init(this);
                    eventCalls.players_changed(this, data.playerList, data.readyList);
                    break;
                case QuickLobby.CODE.SSE.INVALID_LOBBY:
                case QuickLobby.CODE.SSE.INVALID_PLAYER:
                    eventCalls.error(this, data.response, data.data);
                    this.close();
                    break;
                case QuickLobby.CODE.SSE.PLAYER_JOINED:
                    eventCalls.player_join(this, data.player);
                    eventCalls.players_changed(this, data.playerList, data.readyList);
                    break;
                case QuickLobby.CODE.SSE.PLAYER_LEFT:
                    eventCalls.player_leave(this, data.player);
                    eventCalls.players_changed(this, data.playerList, data.readyList);
                    break;
                case QuickLobby.CODE.SSE.READY_UPDATED:
                    eventCalls.ready_changed(this, data.readyList);
                    break;
                case QuickLobby.CODE.SSE.LOBBY_STARTED:
                    eventCalls.lobby_start(this);
                    break;
                case QuickLobby.CODE.SSE.LOBBY_ENDED:
                    eventCalls.lobby_end(this);
                    break;
                case QuickLobby.CODE.SSE.CUSTOM:
                    eventCalls.custom(this, data.data);
                    break;
                default:
                    console.warn("Received unknown SSE. %o", data);
            }
        };

        setTimeout(() => {
            // Attach SSE afterwards, to allow time for listeners to be attached first
            sse = new EventSource(SSE_URL + "?lobbyId=" + lobby + "&clientId=" + client);
            sse.onmessage = handleSSE;
        }, 200);
    }

};