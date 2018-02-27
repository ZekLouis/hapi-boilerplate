'use strict';

const _             = require('lodash');
const env           = require(`./${(process.env.NODE_ENV || 'development')}`);
const packageJson   = require('../../package.json');

const all           = {
    log : {
        showRouteAtStart : true,
    },
    connections : {
        api : {
            host    : '0.0.0.0',
            port    : process.env.PORT || 8080,
            labels  : ['api'],
        },
    },
    mail : {
        service : 'gmail',
        auth    : {
            user : process.env.MAIL_USER,
            pass : process.env.MAIL_PASSWORD,
        },
    },
    databases : {
        hapi : {
            adapter           : 'k7-mongoose',
            connectionString  : `mongodb://${process.env.MONGO_HOST}/${process.env.MONGO_NAME}`,
            connectionOptions : {
                user   : process.env.MONGO_USER,
                pass   : process.env.MONGO_PASSWORD,
                server : {
                    auto_reconnect : true,
                    socketOptions  : { keepAlive : 1 },
                },
                replset : {
                    auto_reconnect : true,
                    socketOptions  : { keepAlive : 1 },
                },
            },
        },
    },
    test_mail : process.env.MAIL_TEST ? process.env.MAIL_TEST : false,
};

module.exports = _.merge(all, env);
