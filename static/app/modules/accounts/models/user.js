/**
 * Created by andy <andy.sumskoy@gmail.com> on 19/12/13.
 */

define(function(require, exports, module) {
    "use strict";

    // External dependencies.
    var Backbone = require("backbone");

    module.exports = Backbone.Model.extend({

        defaults: {
            fio: "",
            email: "",
            alias: "",
            password: "",
            key: null
        },
        blacklist: ['id', 'key', 'sys'],
        toJSON: function(options) {
            var result =  _.omit(this.attributes, this.blacklist);
            if (!result.password) delete result.password;
            return result;
        },
        urlRoot: "/api/v1/user",
        url: function() {
            var base = this.urlRoot || this.collection.url;
            if (this.isNew()) return base;
            return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + encodeURIComponent(this.id);
        }

    });
});