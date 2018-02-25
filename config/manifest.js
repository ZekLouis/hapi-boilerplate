'use strict';

const Hapi          = require('hapi');
const plugins       = require('./manifest/plugins');
const routes        = require('./manifest/routes');
const serverConfig  = require('./manifest/server');
const models        = require('./manifest/models');

module.exports.init = () => {
    const server = new Hapi.Server();

    return Promise.resolve().then(() => serverConfig.init(server))
        .then(() => (
            // configuration des plugins
            plugins.init(server)
        ))
        .then(() => (
            // configuration des routes
            routes.init(server)
        ))
        .then(() => (
            models.init(server)
        ))
        .then(() => server);
};
