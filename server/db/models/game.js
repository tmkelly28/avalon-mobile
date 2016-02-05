'use strict';

const mongoose = require('mongoose');

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
    name: { type: String },
    previousQuestFail: { type: Number },
    turnOrder: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
    }],
    usePercival: { type: Boolean },
    useMorgana: { type: Boolean },
    useOberon: { type: Boolean },
    useMordred: { type: Boolean },
    useLady: { type: Boolean },
    waitingToPlay: { type: Boolean }
});

mongoose.model('Game', schema);
