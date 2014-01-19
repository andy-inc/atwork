/**
 * Created by andy <andy.sumskoy@gmail.com> on 19/12/13.
 */
define(function(require, exports, module) {
    "use strict";

    // External dependencies.
    var Backbone = require("backbone");

    var UserModel = require("modules/accounts/models/user");

    module.exports = Backbone.Collection.extend({

        model: UserModel,
        url: "/api/v1/user"

    });
});