'use strict';

const Promise = require('bluebird');
const faker = require('faker');
const Boom = require('boom');
const Mailgen = require('mailgen');
const nodemailer = require('nodemailer');
const encrypt           = require('@zeklouis/iut-encrypt');

// contient toutes les méthodes privées de votre plugin
const internals = {
    mailgen : new Mailgen({
        theme   : 'default',
        product : {
            name : 'Users HAPI Project',
            link : 'https://github.com/ZekLouis',
        },
    }),
    newUserEmail(name, login, pass) {
        return {
            body :  {
                name,
                intro       : `Welcome to Users Project! We're very excited to have you on board. login : ${login}, password : ${pass}`,
                dictionnary : {
                    username : login,
                    password : pass,
                },
                outro : 'See you soon on this beautiful API',
            },
        };
    },
    passwordLoginChanged(name, login, pass) {
        console.log(name);
        return {
            body :  {
                name,
                intro       : 'Your password or your login has changed.',
                outro : 'See you soon on this beautiful API',
            },
        };
    },
};

const externals = {
    new(data) {
        const clearPassword = data.password;
        const user = new internals.server.database.users(data);
        return user.save()
            .then(() => {
                const transporter = nodemailer.createTransport(internals.server.app.envs.mail);

                const mail_data = {
                    from    : 'hapilouisproject@gmail.com',
                    to      : 'zeklouis@gmail.com', // user.email,
                    subject : `[HAPI] ${user.lastname} ${user.firstname}: Registration`,
                    html    : internals.mailgen.generate(internals.newUserEmail(`${user.lastname} ${user.firstname}`, user.login, clearPassword)),
                    text    : internals.mailgen.generatePlaintext(internals.newUserEmail(`${user.lastname} ${user.firstname}`, user.login, clearPassword)),
                };

                transporter.sendMail(mail_data);
            }).catch(e => Promise.reject(Boom.notFound('Cannot insert, email may already exist')));
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
                    const transporter = nodemailer.createTransport(internals.server.app.envs.mail);

                    const mail_data = {
                        from    : 'hapilouisproject@gmail.com',
                        to      : 'zeklouis@gmail.com', // user.email,
                        subject : `[HAPI] ${user.lastname} ${user.firstname}: Password or login modification`,
                        html    : internals.mailgen.generate(internals.passwordLoginChanged(`${user.lastname} ${user.firstname}`, user.login, user.password)),
                        text    : internals.mailgen.generatePlaintext(internals.passwordLoginChanged(`${user.lastname} ${user.firstname}`, user.login, user.password)),
                    };

                    transporter.sendMail(mail_data);
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

        return Promise.map(users, user => externals.new(user));
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
                const transporter = nodemailer.createTransport(internals.server.app.envs.mail);

                const mail_data = {
                    from    : 'hapilouisproject@gmail.com',
                    to      : 'zeklouis@gmail.com', // user.email,
                    subject : `[HAPI] ${user.lastname} ${user.firstname}: Password or login modification`,
                    html    : internals.mailgen.generate(internals.passwordLoginChanged(`${user.lastname} ${user.firstname}`, user.login, user.password)),
                    text    : internals.mailgen.generatePlaintext(internals.passwordLoginChanged(`${user.lastname} ${user.firstname}`, user.login, user.password)),
                };

                transporter.sendMail(mail_data);
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
