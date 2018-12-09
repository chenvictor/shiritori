const Interface = new function() {

    const MAIN = document.getElementById("main");
    const LOBBY_SPAN = document.getElementById("lobbyName");
    const PLAYER_SPAN = document.getElementById("displayName");
    const PLAYER_COUNT = document.getElementById("playerCount");
    const TABLE_BODY = document.getElementById("playerTableBody");
    const WORD_MODAL = $('#playModal');
    const PREV_WORD = document.getElementById("prevWord");
    const WORD_INPUT = document.getElementById("inputWord");
    const MSG = document.getElementById("message");
    const READY_BTN = document.getElementById("readyState");

    const SMALL_KANAS = new Set(["ょ", "ゃ", "ゅ"]);
    let toBigKana = (smol) => {
        switch(smol) {
            case "ょ":
                return "よ";
            case "ゃ":
                return "や";
            case "ゅ":
                return "ゆ";
            default:
                throw smol + " is not a small kana!";
        }
    };

    let playerName = null;
    let ready = false;
    let readyEnabled = true;

    this.setLobbyName = function(name) {
        LOBBY_SPAN.innerHTML = name;
    };
    this.setPlayerName = function(name) {
        PLAYER_SPAN.innerHTML = name;
        playerName = name;
    };
    this.setPlayers = function(list) {
        TABLE_BODY.innerHTML = "";  //Clear table body
        for (let i = 0; i < list.length; i++) {
            addPlayer(list[i]);
        }
        PLAYER_COUNT.innerHTML = list.length.toString();
    };

    /*
     * Appends a player to the player list
     */
    let addPlayer = (name) => {
        let row = document.createElement("tr");
        let th = document.createElement("th");
        th.scope = "row";
        th.innerHTML = name;
        if (playerName === name) {
            th.innerHTML += " - (You)"
        }
        let td = document.createElement("td");
        td.innerHTML = "Not Ready";
        row.appendChild(th);
        row.appendChild(td);
        TABLE_BODY.appendChild(row);
    };

    // Show the interface
    this.show = function() {
        MAIN.classList.add("visible");
        MAIN.classList.remove("invisible");
    };

    // Hide the interface
    this.hide = function() {
        MAIN.classList.remove("visible");
        MAIN.classList.add("invisible");
    };

    let toggleReady = () => {
        if (readyEnabled) {
            ready = !ready;
            READY_BTN.classList.remove(ready ? "btn-outline-danger" : "btn-success");
            READY_BTN.classList.add(ready ? "btn-success" : "btn-outline-danger");
            READY_BTN.innerHTML = ready ? "Ready" : "Not Ready";
            READY_BTN.blur();   //remove focus
            Client.readyStateChanged(ready);
        }

        this.setReadyButtonEnabled(false);  // Set disabled, until server responds
    };

    this.setReadyButtonEnabled = (enabled) => {
        readyEnabled = enabled;
        if (enabled) {
            READY_BTN.removeAttribute("disabled");
        } else {
            READY_BTN.setAttribute("disabled", true);
        }
    };

    this.setReadyStates = (states) => {
        let children = TABLE_BODY.children;
        for (let i = 0; i < states.length; i++) {
            setState(children[i], states[i]);
        }
    };

    let setState = function(tr, state) {
        if (tr === null) {
            console.warn("tr is null!");
            return;
        }
        tr.children[1].innerHTML = state ? "Ready" : "Not Ready";
    };

    this.message = function(msg) {
        MSG.innerText = msg;
    };

    this.showWordModal = function(prevWord) {
        WORD_INPUT.value = "";
        if (prevWord === null) {
            PREV_WORD.innerText = "You start!";
            WORD_INPUT.placeholder = "...";
        } else {
            let previous = prevWord.charAt(prevWord.length - 1);
            if (SMALL_KANAS.has(previous)) {
                let bef = prevWord.charAt(prevWord.length - 2);
                previous = "(" + bef + "/" + toBigKana(previous) + ")";
            }
            PREV_WORD.innerText = prevWord;
            WORD_INPUT.placeholder = previous + "...";
        }
        WORD_MODAL.modal('show');
    };

    this.hideWordModal = function() {
        WORD_MODAL.modal('hide');
    };

    this.gameStart = function() {
        this.setReadyButtonEnabled(false);
        this.message("Game Started!");
    };

    this.gameEnd = function() {
        this.message("Waiting for players...");
        //Clear the table body styles
        let children = TABLE_BODY.children;
        for (let child of children) {
            child.classList.remove("lost");
            child.classList.remove("turn");
        }
        this.setReadyButtonEnabled(true);
        toggleReady();
    };

    this.playerEliminated = function(player) {
        //Highlight the player row
        let children = TABLE_BODY.children;
        for (let child of children) {
            if (child.children[0].innerHTML === player) {
                child.classList.add("lost");
            }
        }
    };

    this.playerTurn = function(player) {
        //Highlight the player row
        let children = TABLE_BODY.children;
        for (let child of children) {
            if (child.children[0].innerHTML === player) {
                child.classList.add("turn");
            } else {
                child.classList.remove("turn");
            }
        }
    };

    WORD_MODAL.on('shown.bs.modal', () => {
        WORD_INPUT.focus();
    });
    READY_BTN.addEventListener("click", toggleReady);
};