'use strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    playersNeeded: { type: Number },
    questNumber: { type: Number },
    status: {
        type: String,
        enum: ['success', 'fail']
    },
    toFail: { type: Number }
});

mongoose.model('Quest', schema);
