// On load, validate lobbyId

const Auth = new function() {

    let lobbyId;
    let usingPass = true;

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

    let init = function() {
        lobbyId = getLobbyId();

        if (lobbyId === false || lobbyId.length === 0) {
            console.error("No lobbyId supplied");
            CustomAlert.showMessage("Error: Missing lobbyId!");
        } else {
            console.log("Loaded - LobbyId: %s, validating", lobbyId);
            QuickLobby.checkLobby(lobbyId).then((hasPassword) => {
                if (!hasPassword) {
                    document.getElementById('passwordFormGroup').style.display = "none";
                    usingPass = false;
                } else {
                    //stub
                }
                $('#authModal').modal('show');
            }).catch((error) => {
                CustomAlert.showMessage(error);
            });
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
        if (usingPass && pass.length === 0) {
            // invalid
            inputPass.classList.add("is-invalid");
            return;
        }
        if (name.length === 0) {
            // invalid
            inputName.classList.add("is-invalid");
            return;
        }
        QuickLobby.joinLobby(lobbyId, pass, name).then((response) => {
            $('#authModal').modal('hide');
            Shiri.setClient(response);
        }).catch((error) => {
            CustomAlert.showMessage(error);
        });
    };

    let onXHRResponse = function(res) {
        console.debug("Response received: %o", res);
        switch (res.response) {
            case Code.ERROR.LOBBY_DNE:
                $('#authModal').modal('hide');
                CustomAlert.showMessage("This game session is invalid or has expired");
                break;
            case Code.ERROR.PASS_WRONG:
                CustomAlert.showMessage("Password incorrect!");
                break;
            case Code.INVALID.PLAYER_NAME:
                CustomAlert.showMessage("Name invalid!");
                break;
            case Code.ERROR.NAME_IN_USE:
                CustomAlert.showMessage("Name is taken, try a different one.");
                break;
            case Code.ERROR.LOBBY_FULL:
                CustomAlert.showMessage("Lobby is full!");
                break;
            case Code.ERROR.LOBBY_STARTED:
                CustomAlert.showMessage("Game has already started!");
                break;
            case Code.SUCCESS:
                $('#authModal').modal('hide');
                Client.init(lobbyId, res.message);
                break;
        }
    };

    window.addEventListener("load", init);
};