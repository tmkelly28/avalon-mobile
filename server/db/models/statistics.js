'use strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
	owner: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
        index: true
	},
    wins: {
        type: Number,
        default: 0
    },
    losses: {
        type: Number,
        default: 0
    },
    loyal: {
        type: Number,
        default: 0
    },
    minion: {
        type: Number,
        default: 0
    },
    merlin: {
        type: Number,
        default: 0
    },
    percival: {
        type: Number,
        default: 0
    },
    mordred: {
        type: Number,
        default: 0
    },
    morgana: {
        type: Number,
        default: 0
    },
    oberon: {
        type: Number,
        default: 0
    },
    assassin: {
        type: Number,
        default: 0
    },
    guessedMerlin: {
        type: Number,
        default: 0
    }
});

mongoose.model('Statistics', schema);
