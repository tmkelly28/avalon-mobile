'use strict';

app.filter('byTurnOrder', function () {
    return function (players, turnOrder) {
        let playerKeys = [],
            order = [],
            rtn = [];

        if (players) playerKeys = Object.keys(players);
        else return players;

        if (turnOrder) order = turnOrder.map(_user => _user.playerKey);
        else return players;

        playerKeys.forEach((key, index) => {
            let idx = order.indexOf(key);
            rtn[idx] = players[key];
        });

        return rtn;
    }
});
