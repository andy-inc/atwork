define(function(require, exports, module) {
    "use strict";

    // External dependencies.
    var Backbone = require("backbone");

    module.exports = Backbone.Model.extend({

        defaults: {
            day: new Date(),
            duration: 0,
            ranges: []
        }

    });
});