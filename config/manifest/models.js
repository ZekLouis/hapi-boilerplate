'use strict';
const extend    = require('lodash/extend');
const path      = require('path');
const modelsDir = path.join(__dirname, '../../app/models/');
const envConfig = require('../environments/all');
const bluebird  = require('bluebird');

module.exports.init = server => new Promise((resolve, reject) => {
    server.register({
        register : require('k7'),
        options     : extend(envConfig.databases.hapi, {
            models   : [path.join(modelsDir, '**/*.js')],
            adapter  : require(envConfig.databases.hapi.adapter),
            promise  : bluebird,
        }),
    }, (err) => {
        if (err) {
            reject(err);
            return;
        }
        resolve();
    });
});
