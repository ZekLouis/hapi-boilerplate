'use strict';

const Promise = require('bluebird');
const faker = require('faker');
const Boom = require('boom');
const encrypt           = require('@zeklouis/iut-encrypt');

// contient toutes les méthodes privées de votre plugin
const internals = {};

const externals = {
    new(data, sendmail) {
        const clearPassword = data.password;
        const user = new internals.server.database.users(data);
        if (sendmail) {
            internals.server.plugins.mails.new(user, clearPassword);
        }
        return user.save();
    },
    get() {
        return internals.server.database.users.find({});
    },
    get_id(id) {
        return internals.server.database.users.findOne({ _id : id })
            .then((user) => {
                if (!user) {
                    return Promise.reject(Boom.notFound('User not found'));
                }

                return user;
            });
    },
    delete(id) {
        return internals.server.database.users.findOne({ _id : id })
            .then((user) => {
                if (!user) {
                    return Promise.reject(Boom.notFound('User not found'));
                }

                return internals.server.database.users.remove({ _id : id });
            });
    },
    update(id, data) {
        return internals.server.database.users.findOne({ _id : id })
            .then((user) => {
                if (!user) {
                    return Promise.reject(Boom.notFound('User not found'));
                }

                if (data.login !== user.login) {
                    internals.server.plugins.mails.update(user);
                }
                user.set(data);
                return user.save();
            });
    },
    generate() {
        const users = [];
        for (let i = 0; i < 100; i++) {
            users.push({
                login      : faker.Internet.userName(),
                password  : faker.Internet.domainName() + faker.Internet.userName(),
                email      : faker.Internet.email(),
                firstname  : faker.Name.firstName(),
                lastname   : faker.Name.lastName(),
                company   : faker.Company.companyName(),
            });
        }

        return Promise.map(users, user => externals.new(user, false));
    },
    auth(login, password) {
        return internals.server.database.users.findOne({
            login,
            password : encrypt.sha1(password),
        }).then((user) => {
            if (user !== null) {
                return { msg : 'ok' };
            } else {
                return { msg : 'nok' };
            }
        }).catch(() => ({ msg : 'nok' }));
    },
    setPassword(id, oldpassword, password) {
        return internals.server.database.users.findOne({
            _id      : id,
            password : encrypt.sha1(oldpassword),
        }).then((user) => {
            if (user !== null) {
                user.set({
                    password,
                });
                internals.server.plugins.mails.update(user);
                return user.save();
            } else {
                return Promise.reject(Boom.notFound('User not found'));
            }
        });
    },
    register(server, options, next) {
        internals.server    = server.root;
        internals.settings  = options;

        server.expose('get', externals.get);
        server.expose('get_id', externals.get_id);
        server.expose('generate', externals.generate);
        server.expose('update', externals.update);
        server.expose('delete', externals.delete);
        server.expose('new', externals.new);
        server.expose('auth', externals.auth);
        server.expose('setPassword', externals.setPassword);

        next();
    },
};

externals.register.attributes = {
    name    : 'users',
};

module.exports.register = externals.register;
