(function() {
    /**
     *
     * @param params
     * @param [model]
     * @constructor
     */
    var Page = function(params, model) {
        if (params) {
            this.id = params.id;
            this.params = params;
        }
        this.model = model;

        this._inited = false;
    };

    Page.prototype.getKey = function() {
        return decodeURIComponent($.param(_.extend({id: this.id}, this.params)));
    };

    Page.prototype.init = function() {
        if (this._inited) {
            return;
        }

        this._inited = true;

        if (_.isFunction(window[this.id])) {
            this.$node = $(window[this.id](_.extend(this.model, this.params)))
                .appendTo($('body'))
                .addClass('hidden');
        } else {
            console.error('Can\'t construct page. There is neither a node in html nor a template constructor');
        }
    };

    Page.prototype.load = function load() {
        this.$node.addClass('with-transition').removeClass('hidden');
    };

    Page.prototype.unload = function unload() {
        this.$node.removeClass('with-transition').addClass('hidden');
    };

    module.exports = Page;

    /*App.Page.prototype.resolveOnAnimationEnd = function() {
        var that = this;

        that.$node.one('transitionend mozTransitionEnd webkitTransitionEnd oTransitonEnd', function() {
            that.deferred.resolve();
        });
    };*/

})();
