const PlayForm = new function() {
    const ERROR_LOBBY_BLANK = 0;
    const ERROR_PASS_BLANK = 1;

    let playModal;
    let loadingModal;
    let lobby;
    let pass;

    this.submit = function() {
        lobby.classList.remove("is-invalid");
        pass.classList.remove("is-invalid");
        let payload = getPayload();
        let res = validate(payload);
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
        playModal.on("shown.bs.modal", () => {
            lobbyInput.focus();
        });
    };
    let getPayload = function() {
        return {
            type: "start",
            name: lobby.value,
            pass: pass.value,
        };
    };

    // Return true if payload is valid, an error otherwise
    let validate = function(payload) {
        console.log("Validating payload");
        if(payload.name.length === 0) {
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
        console.log(payload);
        playModal.modal('hide');
        loadingModal.modal('show');
        setTimeout(() => {
            ShiriServer.requestLobby(payload, (msg) => {
                loadingModal.modal('hide');
                CustomAlert.showMessage(msg);
            }, (response) => {
                loadingModal.modal('hide');
                console.log("Success: " + response);
                CustomAlert.showMessage(response);
            });
        }, 500);
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