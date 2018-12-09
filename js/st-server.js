const ShiriServer = new function() {

    /**
     * Requests a lobby from the server
     * @param payload       payload to send
     * @param onFail        method to run on failure
     * @param onSuccess     method to run on success
     */
    this.requestLobby = function(payload, onFail, onSuccess) {
        let xhr = openXHR();
        xhr.onload = function() {
            if (xhr.status === 200) {
                onSuccess(xhr.responseText);
            } else {
                console.log('Request failed, status: ' + xhr.status);
                onFail(xhr.status);
            }
        };
        xhr.onerror = function(e) {
            console.log(e);
            onFail("Failed to connect to server.");
        };
        let stringified = JSON.stringify(payload);
        console.log("Sending: " + stringified);
        xhr.send(stringified);
    };

    /**
     * Checks the server to see if the lobbyId is valid
     * @param lobbyId       lobbyId to check
     * @param onResult      method to run when a result is received
     */
    this.validateLobby = function(lobbyId, onResult) {
        let xhr = openXHR();

        xhr.onload = function() {
            if (xhr.status === 200) {
                let json = JSON.parse(xhr.responseText);
                if (json.response === Code.SUCCESS) {
                    onResult(json.message)
                } else {
                    onResult(false);
                }
            } else {
                console.log('Request failed: ' + xhr.status);
                onResult(false);
            }
        };
        xhr.onerror = function(e) {
            console.error(e);
            onResult(false);
        };
        let stringified = JSON.stringify({
            type: "validateId",
            lobbyId: lobbyId
        });
        console.log("Sending: " + stringified);
        xhr.send(stringified);
    };

    /**
     * Requests a client from the server
     * @param lobbyId       the lobby to request from
     * @param password      the lobby password for authentication
     * @param displayName   display/player name
     * @param callback      callback to call with the result
     */
    this.requestClient = function(lobbyId, password, displayName, callback) {
        let xhr = openXHR();

        xhr.onload = () => {
            if (xhr.status === 200) {
                callback(JSON.parse(xhr.responseText));
            } else {
                callback(false);
            }
        };
        xhr.onerror = () => {
            callback(false);
        };
        xhr.send(JSON.stringify({
            type: "join",
            lobbyId: lobbyId,
            pass: password,
            displayName: displayName
        }));
    };

    /**
     * Notify the server of a ready state change
     * @param lobbyId       lobby id
     * @param clientId      client id
     * @param ready         ready state (boolean)
     */
    this.notifyReadyState = function(lobbyId, clientId, ready) {
        let xhr = openXHR();
        xhr.send(JSON.stringify({
            type: "ready",
            lobbyId: lobbyId,
            clientId: clientId,
            ready: ready
        }));
    };

    /**
     * Submit a word
     * @param lobbyId       lobby id
     * @param clientId      client id
     * @param word          word
     */
    this.submitWord = function(lobbyId, clientId, word) {
        let xhr = openXHR();
        xhr.send(JSON.stringify({
            type: "msg",
            lobbyId: lobbyId,
            clientId: clientId,
            subtype: "word",
            word: word,
        }));
    };

    /**
     * Opens an XMLHttpRequest to the server
     */
    let openXHR = function() {
        const URL = "https://shiritori.glitch.me/shiritori";
        const headers = {
            'Accept': '*/*',
            'Content-Type': 'application/json'
        };

        let xhr = new XMLHttpRequest();
        xhr.open('POST', URL);
        Object.keys(headers).forEach((key, index) => {
            xhr.setRequestHeader(key, headers[key]);
        });
        return xhr;
    };
};