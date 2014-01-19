/**
 * Created by andy <andy.sumskoy@gmail.com> on 19/12/13.
 */
define(function(require, exports, module) {
    "use strict";

    // External dependencies.
    var Backbone = require("backbone");

    var KeyModel = require("modules/keys/models/key");

    module.exports = Backbone.Collection.extend({

        model: KeyModel,
        url: "/api/v1/key"

    });
});