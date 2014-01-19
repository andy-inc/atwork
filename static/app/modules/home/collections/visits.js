/**
 * Created by Andy <andy@sumskoy.com> on 11/01/14.
 */
define(function(require, exports, module) {
    "use strict";

    // External dependencies.
    var Backbone = require("backbone");

    var VisitModel = require("modules/home/models/visits");

    module.exports = Backbone.Collection.extend({

        model: VisitModel,
        url: "/api/v1/visit/self/ranges"

    });
});