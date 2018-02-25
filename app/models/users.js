'use strict';

const jsonToMongoose    = require('json-mongoose');
const mongoose          = require('k7-mongoose').mongoose();
const encrypt           = require('@zeklouis/iut-encrypt');
const async             = require('async');

module.exports = jsonToMongoose({
    mongoose,
    collection  : 'users',
    schema      : require('../schemas/users'),
    pre         : {
        save : (doc, next) => {
            async.parallel({
                password : (done) => {
                    doc.password = encrypt.sha1(doc.password);
                    done();
                },
            }, next);
        },
    },
    schemaUpdate : (schema) => {
        schema.email.unique  = true;
        return schema;
    },
    transform : (doc, ret, options) => {
        delete ret.password;

        return ret;
    },
    options : {

    },
});
