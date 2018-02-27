'use strict';

const Promise = require('bluebird');
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
                intro : `Welcome to Users Project! We're very excited to have you on board. login : ${login}, password : ${pass}`,
                outro : 'See you soon on this beautiful API',
            },
        };
    },
    passwordLoginChanged(name) {
        return {
            body :  {
                name,
                intro : 'Your password or your login has changed.',
                outro : 'See you soon on this beautiful API',
            },
        };
    },
};

const externals = {
    new(user, clearPassword) {
        const transporter = nodemailer.createTransport(internals.server.app.envs.mail);
        let to = user.email;
        if (internals.server.app.envs.test_mail !== false) {
            to = internals.server.app.envs.test_mail;
        }

        const mail_data = {
            from    : 'hapilouisproject@gmail.com',
            to,
            subject : `[HAPI] ${user.lastname} ${user.firstname}: Registration`,
            html    : internals.mailgen.generate(internals.newUserEmail(`${user.lastname} ${user.firstname}`, user.login, clearPassword)),
            text    : internals.mailgen.generatePlaintext(internals.newUserEmail(`${user.lastname} ${user.firstname}`, user.login, clearPassword)),
        };

        return transporter.sendMail(mail_data);
    },
    update(user) {
        const transporter = nodemailer.createTransport(internals.server.app.envs.mail);

        const mail_data = {
            from    : 'hapilouisproject@gmail.com',
            to      : 'zeklouis@gmail.com', // user.email,
            subject : `[HAPI] ${user.lastname} ${user.firstname}: Password or login modification`,
            html    : internals.mailgen.generate(internals.passwordLoginChanged(`${user.lastname} ${user.firstname}`)),
            text    : internals.mailgen.generatePlaintext(internals.passwordLoginChanged(`${user.lastname} ${user.firstname}`)),
        };

        return transporter.sendMail(mail_data);
    },
    register(server, options, next) {
        internals.server    = server.root;
        internals.settings  = options;

        server.expose('update', externals.update);
        server.expose('new', externals.new);

        next();
    },
};

externals.register.attributes = {
    name    : 'mails',
};

module.exports.register = externals.register;
