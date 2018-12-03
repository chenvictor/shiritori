const ShiriServer = new function() {

    const URL = "https://shiritori.glitch.me/shiritori";
    const PLAY_URL = "play/index.html";
    let xhr = null;

    this.requestLobby = function(payload, onFail) {

        xhr = new XMLHttpRequest();

        let headers = {
            'Accept': '*/*',
            'Content-Type': 'application/json'
        };
        xhr.open('POST', URL);
        Object.keys(headers).forEach((key, index) => {
            xhr.setRequestHeader(key, headers[key]);
        });

        xhr.onload = function() {
            if (xhr.status === 200) {
                handleResponse(xhr.responseText);
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

    this.cancelRequest = function() {
        if (xhr !== null) {
            xhr.abort();
            xhr = null;
        }
    };

    let handleResponse = function(text) {
        console.log("Response");
        console.log(text);
        window.location.replace(PLAY_URL);


    };
};