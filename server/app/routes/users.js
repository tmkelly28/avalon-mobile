'use strict';

const router = require('express').Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Statistics = mongoose.model('Statistics');
const _ = require('lodash');
module.exports = router;

// POST to create a new user
router.post('/', function create (req, res, next) {
    let _user;

	User.create(req.body)
        .then(user => {
            _user = user;
            return Statistics.create({ owner: user._id })
        })
    	.then(() => res.status(201).json(_user))
    	.then(null, next);
});

router.param('id', function setUser (req, res, next, id) {
	User.findById(id).exec()
    	.then(user => {
    		req.targetUser = user;
    		next();
    	})
        .then(null, next);
});

// GET to find a single user and associated statistics
router.get('/:id', function fetchOne (req, res) {
     res.status(200).json(req.targetUser);
});

// PUT to update a single user
router.put('/:id', function updateUser (req, res, next) {
	_.extend(req.targetUser, req.body);

	req.targetUser.save()
    	.then(update => res.status(201).json(update))
    	.then(null, next);
});

// GET to find a single user's statistics
router.get('/:id/statistics', function fetchStatistics (req, res, next) {
	Statistics.findOne({
		owner: req.targetUser._id
	})
    	.then(statistics => res.status(200).json(statistics))
    	.then(null, next);
});

// PUT to update a single user's statistics
router.put('/:id/statistics', function updateStatistics (req, res, next) {
	Statistics.findOne({
		owner: req.targetUser._id
	})
    	.then(statistics => {
    		if (req.body.character === 'Merlin') statistics.merlin++;
    		if (req.body.character === 'Mordred') statistics.mordred++;
    		if (req.body.character === 'Morgana') statistics.morgana++;
    		if (req.body.character === 'Percival') statistics.percival++;
    		if (req.body.character === 'Oberon') statistics.oberon++;
    		if (req.body.character === 'Assassin') statistics.assassin++;
    		if (req.body.character === 'Servant of Arthur') statistics.loyal++;
    		if (req.body.character === 'Minion of Mordred') statistics.minion++;

    		if (req.body.loyalty === req.body.winner) statistics.wins++;
    		else statistics.losses++;

    		if (req.body.character === 'Assassin' && req.body.guessedMerlin) statistics.guessedMerlin++;

    		return statistics.save();
    	})
    	.then(update => res.status(200).json(update))
    	.then(null, next);
});
