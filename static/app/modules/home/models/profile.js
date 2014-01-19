define(function(require, exports, module) {
    "use strict";

    // External dependencies.
    var Backbone = require("backbone");

    module.exports = Backbone.Model.extend({

        defaults: {
            fio: "",
            key: null
        },
        blacklist: ['id', 'key', 'sys'],
        toJSON: function(options) {
            return _.omit(this.attributes, this.blacklist);
        },
        urlRoot: "/api/v1/user",
        url: function() {
            var base = this.urlRoot || this.collection.url;
            if (this.isNew()) return base + "/self";
            return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + encodeURIComponent(this.id);
        }

    });
});