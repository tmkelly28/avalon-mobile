'use strict';

const mongoose = require('mongoose');
const Game = mongoose.model('Game');
const User = mongoose.model('User');
const Firebase = require('firebase');
const GamesRef = new Firebase('https://resplendent-torch-2655.firebaseio.com/games/');
const _ = require('lodash');

module.exports = {

    setGame: (req, res, next, id) => {
        req.gameRef = GamesRef.child(id);
        next();
    },

    create: (req, res) => {
        let ref = GamesRef.push();
        ref.set(req.body);
        res.json(ref.key());
    },

    addPlayer: (req, res, next) => {
        let ref = req.gameRef.child('players').push();
        let key = ref.key();

        return User.findById(req.body._id).exec()
            .then(player => {
                player.playerKey = key;
                return player.save();
            })
            .then(updatedPlayer => {
                ref.set(_.pick(updatedPlayer,
                    ['_id',
                    'email',
                    'displayName',
                    'playerKey',
                    'picture']));
                res.json(key)
            })
            .then(null, next);
    }
}


