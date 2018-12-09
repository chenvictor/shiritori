// Mirror of the server's response codes
const Code = {
    SUCCESS: 600,
    FAIL:    601,
    MISSING:
        {
            LOBBY:   700,
            PLAYER:  701,
            PASS:    702,
        },
    INVALID:
        {
            REQUEST_TYPE:  800,
            LOBBY_NAME:    801,
            LOBBY_PASS:    802,
            PLAYER_NAME:   803,
        },
    ERROR:
        {
            LOBBY_DNE:      900,
            PLAYER_DNE:     901,
            NAME_IN_USE:    902,
            LOBBIES_FULL:   903,
            PASS_WRONG:     904,
            LOBBY_FULL:     905,
            LOBBY_STARTED:  906,
        },
    BROADCAST:
        {
            PLAYERS_UPDATED:      1000,
            READY_STATE_UPDATED:  1001,
            GAME_START:        1002,
            GAME_END:          1003,
        },
    PLAYER:
        {
            INIT:                  1100,
            READY_STATE_RECEIVED:  1101,
        },
};

const ShiriCode = {
    YOUR_TURN:    9,
    PLAYER_TURN: 10,
    PLAYER_LOST: 11,
    MOVE_MADE:   12,
    FEEDBACK:    13,
    WINNER:      14,
};