'use strict';

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const mongoose = require('mongoose');
const UserModel = mongoose.model('User');
const StatisticsModel = mongoose.model('Statistics');

module.exports = function (app) {

    const googleConfig = app.getValue('env').GOOGLE;

    const googleCredentials = {
        clientID: googleConfig.clientID,
        clientSecret: googleConfig.clientSecret,
        callbackURL: googleConfig.callbackURL
    };

    function verifyCallback (accessToken, refreshToken, profile, done) {

        UserModel.findOne({ 'google.id': profile.id }).exec()
            .then(function (user) {
                let _user;

                if (user) {
                    return user;
                } else {
                    let email = profile.emails[0].value;
                    return UserModel.create({
                        email: email,
                        picture: profile._json.picture,
                        google: {
                            id: profile.id
                        }
                    })
                    .then(newUser => {
                        _user = newUser;
                        return StatisticsModel.create({ owner: newUser._id })
                    })
                    .then(() => _user);
                }

            }).then(function (userToLogin) {
                done(null, userToLogin);
            }, function (err) {
                console.error('Error creating user from Google authentication', err);
                done(err);
            });

    };

    passport.use(new GoogleStrategy(googleCredentials, verifyCallback));

    app.get('/auth/google', passport.authenticate('google', {
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ]
    }));

    app.get('/auth/google/callback',
        passport.authenticate('google', { failureRedirect: '/home' }),
        function (req, res) {
            res.redirect('/');
        });

};
