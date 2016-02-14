'use strict';

const mongoose = require('mongoose');
// const Firebase = require('firebase');
// const GamesRef = new Firebase('https://resplendent-torch-2655.firebaseio.com/games/');
// const _ = require('lodash');

const schema = new mongoose.Schema({
    currentGamePhase: {
        type: String,
        enum: [
            'team building',
            'team voting',
            'quest voting',
            'using lady',
            'guess merlin',
            'end - evil wins',
            'end - evil guessed merlin',
            'end - good wins'
        ]
    },
    currentLadyOfTheLake: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
    },
    currentPlayerTurn: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
    },
    currentQuestApproves: { type: Number },
    currentQuestFail: { type: Number },
    currentQuestIdx: { type: Number },
    currentQuestPlayersGoing: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
    }],
    currentQuestPlayersNeeded: { type: Number },
    currentQuestToFail: { type: Number },
    currentQuestRejects: { type: Number },
    currentQuestSuccess: { type: Number },
    currentTurnIdx: { type: Number },
    currentVoteTrack: { type: Number },
    evilScore: { type: Number },
    gameOver: { type: Boolean },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    hostName: { type: String },
    loyalScore: { type: Number },
    name: {
        type: String,
        required: true
    },
    players: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
    }],
    previousQuestFail: { type: Number },
    previousQuestSuccess: { type: Number },
    quests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quest'
    }],
    roomLeftOnTeam: { type: Boolean },
    size: { type: Number },
    targetSize: { type: Number },
    turnOrder: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
    }],
    usePercival: {
        type: Boolean,
        default: false
    },
    useMorgana: {
        type: Boolean,
        default: false
    },
    useOberon: {
        type: Boolean,
        default: false
    },
    useMordred: {
        type: Boolean,
        default: false
    },
    useLady: {
        type: Boolean,
        default: false
    },
    waitingToPlay: {
        type: Boolean,
        default: true
    },
});

// const populateFields = 'currentLadyOfTheLake currentPlayerTurn currentQuestPlayersGoing host players quests turnOrder';

// schema.pre('save', function (next) {

//     Promise
//     .resolve(this.populate(populateFields))
//     .then(doc => {
//         console.log(doc)
//         next()
//     })
// });

mongoose.model('Game', schema);
