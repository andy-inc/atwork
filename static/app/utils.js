define(function(require, exports, module) {
	"use strict";

	// External dependencies.
	var _ = require("underscore");
	var $ = require("jquery");
	var Backbone = require("backbone");

	var utils = module.exports;

	utils.money = {
		format: function(n, c, d, t) {
			var c = isNaN(c = Math.abs(c)) ? 2 : c,
				d = d == undefined ? "." : d,
				t = t == undefined ? "," : t,
				s = n < 0 ? "-" : "",
				i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
				j = (j = i.length) > 3 ? j % 3 : 0;
			return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
		}
	};

	utils.arrays = {
		remove: function(a, from, to) {
			var rest = a.slice((to || from) + 1 || a.length);
			a.length = from < 0 ? a.length + from : from;
			a.push.apply(a, rest);
			return a;
		}
	};
});