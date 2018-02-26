'use strict';

const handler = require('../handlers/default');
const users = require('../handlers/users');
const mails = require('../handlers/mails');
const users_schema = require('../schemas/users');
const Joi = require('joi');
Joi.objectId = require('joi-objectId')(Joi);

exports.register = (server, options, next) => {
    server.route([
        {
            method : 'POST',
            path   : '/authent/{login}/{password}',
            config : {
                description : 'Authentication',
                notes       : 'Authentification des utilisateurs',
                tags        : ['api'],
                handler     : mails.auth,
                plugins     : {
                    'hapi-swagger' : {
                        payloadType : 'form',
                    },
                },
                validate    : {
                    params : {
                        login    : Joi.string(),
                        password : Joi.string(),
                    },
                },
            },
        },
        {
            method : 'GET',
            path   : '/',
            config : {
                description : 'Base route',
                notes       : 'Route par défaut du projet',
                tags        : ['api'],
                handler     : handler.root,
            },
        },
        {
            method : 'GET',
            path   : '/users',
            config : {
                description : 'Users get',
                notes       : 'Récupération de tous les utilisateurs ou en fonction de paramètres GET pour filtrer',
                tags        : ['api'],
                handler     : users.get,
            },
        },
        {
            method : 'PUT',
            path   : '/users/generate',
            config : {
                description : 'Users generate',
                notes       : 'Génération de 100 nouveaux users',
                tags        : ['api'],
                handler     : users.generate,
            },
        },
        {
            method : 'GET',
            path   : '/users/{_id}',
            config : {
                description : 'Users get avec id',
                notes       : 'Récupération d\'un utilisateur. Si non trouvé retourne une 404',
                tags        : ['api'],
                handler     : users.get_id,
                validate    : {
                    params  : {
                        _id : Joi.objectId().required(),
                    },
                },
            },
        },
        {
            method : 'POST',
            path   : '/users',
            config : {
                description : 'Sauvegarde d\'un user',
                notes       : 'Sauvegarde un nouvel utilisateur',
                tags        : ['api'],
                handler     : users.post,
                validate    : {
                    payload : users_schema,
                },
            },
        },
        {
            method : 'PUT',
            path   : '/users/{_id}',
            config : {
                description : 'Modification d\'un user',
                notes       : 'Modifie un utilisateur existant. Si non trouvé retourne une 404',
                tags        : ['api'],
                handler     : users.put,
                validate    : {
                    params  : {
                        _id : Joi.objectId().required(),
                    },
                    payload : users_schema,
                },
            },
        },
        {
            method : 'DELETE',
            path   : '/users/{_id}',
            config : {
                description : 'Suppression d\'un user',
                notes       : 'Supprime un utilisateur existant. Si non trouvé retourne une 404',
                tags        : ['api'],
                handler     : users.delete,
                validate    : {
                    params : {
                        _id : Joi.objectId().required(),
                    },
                },
            },
        },
        {
            method : 'PUT',
            path   : '/users/{id}/{oldpassword}/{password}',
            config : {
                description : 'Modification du mot de passe d\'un user',
                notes       : 'Modification du mot de passe d\'un user',
                tags        : ['api'],
                handler     : mails.changePassword,
                validate    : {
                    params : {
                        id          : Joi.objectId().required(),
                        oldpassword : Joi.string(),
                        password    : Joi.string(),
                    },
                },
            },
        },
    ]);
    next();
};

exports.register.attributes = {
    name : 'default-routes',
};
