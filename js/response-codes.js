// Mirror of the server's response codes
let exports = {};
exports.UNKNOWN = 600;
exports.SUCCESS = 601;

// Missing errors
exports.MISSING = {
    LOBBY: 700,
    PLAYER: 701,
};

// Invalid errors
exports.INVALID = {
    LOBBY_ID: 800,
    PLAYER_ID: 801,
    LOBBY_NAME: 802,
    LOBBY_PASS: 803,
    PLAYER_NAME: 804,
};

// In use
exports.FAIL = {
    NAME_IN_USE: 900,
    LOBBIES_FULL: 901,
    PASSWORD_WRONG: 902,
};

exports.EVENT = {
    INITIALIZE: 1000,
    PLAYERS_UPDATED: 1001,
    MOVE_MADE: 1002,
    READY_STATE_UPDATED: 1003,
    READY_STATE_RECEIVED: 1004,
};

const ResponseCode = exports;