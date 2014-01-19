define(function(require, exports, module) {
    "use strict";

    // External dependencies.
    var Backbone = require("backbone");


    module.exports = Backbone.Model.extend({

        defaults: {
            email: "",
            password: "",
            fio: "",
            failed: false,
            accepted: false
        },
        blacklist: ['failed', 'accepted', 'fio', 'id'],
        toJSON: function(options) {
            return _.omit(this.attributes, this.blacklist);
        },
        url: "/api/v1/auth"

    });
});