'use strict';

module.exports.post = (request, response) => {
    request.server.plugins.users.new(request.payload)
        .then(user => response(user).code(201))
        .catch(err => response(err));
};

module.exports.put = (request, response) => {
    request.server.plugins.users.update(request.params._id, request.payload)
        .then(user => response(user).code(200))
        .catch(err => response(err));
};

module.exports.delete = (request, response) => {
    request.server.plugins.users.delete(request.params._id)
        .then(users => response(users).code(204))
        .catch(err => response(err));
};

module.exports.generate = (request, response) => {
    request.server.plugins.users.generate()
        .then(users => response(users).code(201))
        .catch(err => response(err));
};

module.exports.get = (request, response) => {
    request.server.plugins.users.get()
        .then(users => response(users).code(200))
        .catch(err => response(err));
};

module.exports.get_id = (request, response) => {
    request.server.plugins.users.get_id(request.params._id)
        .then(user => response(user).code(200))
        .catch(err => response(err));
};

module.exports.auth = (request, response) => {
    request.server.plugins.users.auth(request.params.login, request.params.password)
        .then(user => response(user).code(200))
        .catch(err => response(err));
};

module.exports.changePassword = (request, response) => {
    request.server.plugins.users.setPassword(request.params.id, request.params.oldpassword, request.params.password)
        .then(user => response(user).code(200))
        .catch(err => response(err));
};
