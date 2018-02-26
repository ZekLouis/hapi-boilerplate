'use strict';

const async     = require('async');
const envConfig = require('../environments/all');

module.exports.init = server => (
    new Promise((resolve, reject) => {
        async.series({
            good(done) {
                server.register({
                    register : require('good'),
                }, done);
            },
            blipp(done) {
                server.register({
                    register : require('blipp'),
                    options  : {
                        showStart : envConfig.log.showRouteAtStart,
                        showAuth  : true,
                    },
                }, done);
            },
            inert(done) {
                server.register({
                    register : require('inert'),
                }, done);
            },
            vision(done) {
                server.register({
                    register : require('vision'),
                }, done);
            },
            swagger(done) {
                server.register({
                    register : require('hapi-swagger'),
                }, done);
            },
            users(done) {
                server.register({
                    register : require('../../app/plugins/users'),
                }, done);
            },
            mails(done) {
                server.register({
                    register : require('../../app/plugins/mails'),
                }, done);
            },
        }, (err) => {
            if (err) {
                reject(err);
                return;
            }

            resolve();
        });
    })
);
