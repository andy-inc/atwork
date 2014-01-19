/**
 * Created by Andy <andy@sumskoy.com> on 11/01/14.
 */
define(function(require, exports, module) {
    "use strict";

    // External dependencies.
    var Backbone = require("backbone");
    var VisitsCollection = require("modules/home/collections/visits");

    var tmpl = require("text!templates/home/visits.html");

    module.exports = Backbone.View.extend({

        template: _.template(tmpl),

        events: {

        },

        initialize: function() {
            _.bindAll(this, 'render', 'onCollectionChange');
            this.app = require("app");
            this.collection = new VisitsCollection();
            this.collection.fetch({success: function(){
                this.onCollectionChange();
            }.bind(this)});
            this.collection.on("change", this.onCollectionChange);
        },

        onCollectionChange: function(){
            var $ranges = this.$('[data-type="range"]').html(''),
                width = $ranges.width();
            if (this.collection.length == 0) return;
            var min, max;
            this.collection.forEach(function(model){
                var ranges = model.get('ranges');
                ranges.forEach(function(range){
                    range.start = new Date(range.start);
                    range.day = new Date(range.day);
                    if (range.stop){
                        range.stop = new Date(range.stop);
                    }
                });


                var sh = ranges[0].start.getHours();
                if (min > sh || min == null){
                    min = sh;
                }
                for(var i = ranges.length-1; i >= 0; i--){
                    if (ranges[i].stop == null) continue;
                    var eh = ranges[i].stop.getHours();
                    if (max < eh || max == null){
                        max = eh;
                    }
                    break;
                }
            });
            if (min > 0) min -= 1;
            max += 1;
            if (min > max){
                min = 0;
                max = 24;
            }
            console.log(min, max);
            var k = width / (max - min);

            var formatNumber = function(n, k){
                var s = '' + n;
                while (s.length < k){
                    s = '0' +s;
                }
                return s;
            };
            var formatDuration = function(d){
                var hours   = Math.floor(d / 60);
                var minutes = Math.floor(d - (hours * 60));
                var result =  hours + " ч.";
                if (minutes > 0) {
                    result += ' ' + formatNumber(minutes, 2) + ' мин.'
                }
                return result;
            };

            var printLegend = function(){
                var $legend = $('<div class="col-md-12" style="height: 20px"></div>');
                for(var i = 0; i <= max-min; i++){
                    var $range = $('<div class="range legend"></div>');
                    $range.css('left', i * k + 'px');
                    $range.width(k);
                    var s = formatNumber(i+min, 2);
                    $range.text(s);
                    $legend.append($range);
                }
                $ranges.append($legend);
            };
            printLegend();
            this.collection.forEach(function(model){
                var day = new Date(model.get('day')),
                    ranges = model.get('ranges'),
                    duration = model.get('duration');

                var $day = $('<div class="col-md-12" style="height: 20px"></div>');

                ranges.forEach(function(range){
                    if (range.stop == null) return;
                    var $range = $('<div class="range"></div>');
                    if (duration < 8.5*60){
                        $range.addClass('low');
                    }
                    var startHour = range.start.getHours(),
                        stopHour = range.stop.getHours();
                    startHour += range.start.getMinutes() / 60;
                    stopHour += range.stop.getMinutes() / 60;

                    startHour -= min;
                    stopHour -= min;

                    $range.css('left', startHour * k + 'px');
                    $range.width((stopHour - startHour) * k);
                    $day.append($range);
                });
                var $range = $('<div class="range legend bold"></div>');
                $range.css('left', '0px');
                $range.width((max - min)* k);
                $range.text(formatNumber(day.getDate(), 2)+'.'+formatNumber(day.getMonth()+1, 2) + ' на работе: ' + formatDuration(duration));
                $day.append($range);
                $ranges.append($day);
            });
            printLegend();
        },

        render: function() {
            var html = this.template();
            $(this.el).html(html);
            return this;
        }

    });
});
