'use strict';

const router = require('express').Router();
const mongoose = require('mongoose');
const Game = mongoose.model('Game');
const _ = require('lodash');
module.exports = router;

router.get('/', function (req, res, next) {
    Game.find(req.query)
        .then(games => res.status(200).json(games))
        .then(null, next);
});

// POST to create a new game
router.post('/', function create (req, res, next) {
    Game.create(req.body)
        .then(game => res.status(201).json(game))
        .then(null, next);
});

router.param('id', function setGame (req, res, next, id) {
    Game.findById(id).exec()
        .then(game => {
            req.targetGame = game;
            next();
        })
        .then(null, next);
});

// GET to find a single game and associated statistics
router.get('/:id', function fetchOne (req, res) {
     res.status(200).json(req.targetGame);
});

// PUT to update a single game
router.put('/:id', function updateGame (req, res, next) {
    _.extend(req.targetGame, req.body);

    req.targetGame.save()
        .then(update => res.status(201).json(update))
        .then(null, next);
});
