const Client = new function() {
    const LOBBY_ID = window.location.toString().split("?")[1];
    let eventSource;

    let onResult = function(isValid) {
        if (isValid) {
            let main = document.getElementById("main");
            main.classList.remove("invisible");
            main.classList.add("visible");
        } else {
            console.log("ID is invalid");
            CustomAlert.showMessage("This game session is invalid or has expired");
        }
    };






    // On load:
    console.log("Loaded - LobbyId: " + LOBBY_ID);
    if (LOBBY_ID.length === 0) {
        console.error("No lobbyId supplied");
    } else {
        console.log("Checking id");
        ShiriServer.validateLobby(LOBBY_ID, onResult);
    }
};