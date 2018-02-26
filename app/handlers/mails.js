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
