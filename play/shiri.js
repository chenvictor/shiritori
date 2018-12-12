const Shiri = new function() {

    let client;

    this.setClient = function(_client) {
        client = _client;
        init();
    };

    let init = () => {
        client.on('init', (client) => {
            Interface.setReadyButtonEnabled(true);
            Interface.setPlayerName(client.getPlayerName());
            Interface.setLobbyName(client.getLobbyName());
            Interface.show();
        }).on('players_changed', (client, nameList, readyList) => {
            Interface.setPlayers(nameList);
            Interface.setReadyStates(readyList);
        }).on('player_join', (client, name) => {
            console.log("Player %s joined", name);
        }).on('player_leave', (client, name) => {
            console.log("Player %s left", name);
        }).on('error', (client, errorCode, message) => {
            Interface.hide();
            Interface.hideWordModal();
            CustomAlert.showMessage("Error occurred [" + errorCode + "]: " + message);
        }).on('custom', (client, data) => {
            console.log(data);

            switch (data.response) {
                case ShiriCode.YOUR_TURN:
                    Interface.showWordModal(data.lastWord);
                    break;
                case ShiriCode.PLAYER_TURN:
                    Interface.playerTurn(data.player);
                    break;
                case ShiriCode.PLAYER_LOST:
                    Interface.playerEliminated(data.player);
                    break;
                case ShiriCode.MOVE_MADE:
                    Interface.message(data.player + " played the word: " + data.word);
                    break;
                case ShiriCode.FEEDBACK:
                    CustomAlert.showMessage("You were eliminated! " + data.feedback);
                    break;
                case ShiriCode.WINNER:
                    CustomAlert.showMessage("The winner is: " + data.winner);
                    break;
                default:
                    console.warn("Unknown custom data: %o", data);
            }
        }).on('lobby_start', () => {
            Interface.gameStart();
        }).on('lobby_end', () => {
            Interface.gameEnd();
        }).on('ready_changed', (client, list) => {
            Interface.setReadyStates(list);
        });
    };

    this.getClient = function() {
        return client;
    };
};