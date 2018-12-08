// On load, validate lobbyId

const Auth = new function() {

    // Fetch the lobby id from query params
    let getLobbyId = function() {
        let query = window.location.search.substring(1);
        console.debug("URL Query params: " + query);
        let vars = query.split("&");
        for (let i = 0; i < vars.length; i++) {
            let pair = vars[i].split("=");
            if (pair[0] === "lobbyId") {
                return pair[1];
            }
        }
        return false;
    };

    let lobbyId;

    let init = function() {
        lobbyId = getLobbyId();

        if (lobbyId === false || lobbyId.length === 0) {
            console.error("No lobbyId supplied");
            CustomAlert.showMessage("Error: Missing lobbyId!");
        } else {
            console.log("Loaded - LobbyId: %s, validating", lobbyId);
            ShiriServer.validateLobby(lobbyId, onResult);
        }
    };

    let onResult = function(isValid) {
        if (isValid) {
            // prompt a login
            console.debug("prompting login");
            $("#authModal").modal('show');
        } else {
            // Notify user
            CustomAlert.showMessage("This game session is invalid or has expired");
        }
    };

    this.submit = function() {
        console.debug("Auth form submitted");
        let inputPass = document.getElementById("inputPass");
        let inputName = document.getElementById("inputName");
        inputPass.classList.remove("is-invalid");
        inputName.classList.remove("is-invalid");
        let pass = inputPass.value;
        let name = inputName.value.trim();
        if (pass.length === 0) {
            // invalid
            inputPass.classList.add("is-invalid");
            return;
        }
        if (name.length === 0) {
            // invalid
            inputName.classList.add("is-invalid");
            return;
        }
        ShiriServer.requestClient(lobbyId, inputPass.value, inputName.value, onXHRResponse);
    };

    let onXHRResponse = function(res) {
        console.debug("Response received: %o", res);
        switch (res.response) {
            case ResponseCode.INVALID.LOBBY_ID:
                $('#authModal').modal('hide');
                CustomAlert.showMessage("This game session is invalid or has expired");
                break;
            case ResponseCode.FAIL.PASSWORD_WRONG:
                alert("Password incorrect!");
                break;
            case ResponseCode.INVALID.PLAYER_NAME:
                alert("Name invalid!");
                break;
            case ResponseCode.FAIL.NAME_IN_USE:
                alert("Name is taken, try a different one.");
                break;
            case ResponseCode.SUCCESS:
                $('#authModal').modal('hide');
                Client.init(lobbyId, res.message);
                break;
        }
    };

    window.addEventListener("load", init);
};