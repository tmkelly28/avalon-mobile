'use strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    game: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game',
        index: true
    },
    playersNeeded: { type: Number },
    questNumber: { type: Number },
    status: {
        type: String,
        enum: ['success', 'fail']
    },
    toFail: { type: Number }
});

mongoose.model('Game', schema);
