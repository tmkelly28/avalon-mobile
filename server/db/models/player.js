'use strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    character: { type: String },
    displayName: { type: String },
    imageUrl: { type: String },
    knownToEvil: { type: Boolean },
    knownToMerlin: { type: Boolean },
    knownToPercival: { type: Boolean },
    loyalty: {
        type: String,
        enum: ['good', 'evil']
    },
    needToVoteForTeam: { type: Boolean },
    needToVoteOnQuest: { type: Boolean },
    onQuest: { type: Boolean },
    picture: { type: String },
    playerKey: { type: String },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    }
});

mongoose.model('Player', schema);
