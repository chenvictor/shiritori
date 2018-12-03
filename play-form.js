const PlayForm = new function() {
    const ERROR_LOBBY_BLANK = 0;
    const ERROR_PASS_BLANK = 1;

    const TIMEOUT_MILLIS = 3000;    //Time before the server request should be aborted.

    let playModal;
    let loadingModal;
    let lobby;
    let pass;

    let timeoutTimer;

    this.submit = function() {
        lobby.classList.remove("is-invalid");
        pass.classList.remove("is-invalid");
        let payload = getPayload();
        console.log(payload);
        let res = validate(payload);
        console.log("res");
        console.log(res);
        if (res === true) {
            sendForm(payload);
        } else {
            showError(res);
        }
    };
    this.init = function(modal, modal2, lobbyInput, passInput) {
        lobby = lobbyInput;
        pass = passInput;
        playModal = modal;
        loadingModal = modal2;
    };
    let getPayload = function() {
        return {
            lobby: lobby.value,
            pass: pass.value,
        };
    };

    // Return true if payload is valid, an error otherwise
    let validate = function(payload) {
        console.log("validating payload");
        if(payload.lobby.length === 0) {
            return ERROR_LOBBY_BLANK;
        }
        if(payload.pass.length === 0) {
            return ERROR_PASS_BLANK;
        }
        return true;
    };

    let showError = function(errorCode) {
        console.log("form invalid");
        switch (errorCode) {
            case ERROR_LOBBY_BLANK:
                lobby.classList.add("is-invalid");
                lobby.focus();
                break;
            case ERROR_PASS_BLANK:
                pass.classList.add("is-invalid");
                pass.focus();
                break;
        }
    };

    let sendForm = function(payload) {
        console.log("sending form");
        playModal.modal('hide');
        loadingModal.on('shown.bs.modal', function() {
            timeoutTimer = setTimeout(onTimeout, TIMEOUT_MILLIS);
            ShiriServer.requestLobby(payload, (msg) => {
                clearTimeout(timeoutTimer);
                loadingModal.modal('hide');
                CustomAlert.showMessage(msg);
            });
        });
        loadingModal.modal('show');
    };

    let onTimeout = function() {
        console.log("on timeout");
        timeoutTimer = null;
        loadingModal.modal('hide');
        CustomAlert.showMessage("Server connection failed, try again later.");
        ShiriServer.cancelRequest();
    };
};
window.addEventListener("load", () => {
    let modal = $('#playModal');
    let modal2 = $('#loadingModal');
    let lobby = document.getElementById('inputLobby');
    if (lobby === null) {
        console.error("Could not find element with id: inputLobby");
        return;
    }
    let pass = document.getElementById('inputPassword');
    if (pass === null) {
        console.error("Could not find element with id: inputPassword");
        return;
    }
    PlayForm.init(modal, modal2, lobby, pass);
});