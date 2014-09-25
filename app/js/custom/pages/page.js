(function() {
    App.Page = function(options) {
        _.extend(this, options);
        this._inited = false;
    };

    App.Page.prototype.init = function() {
        if (this._inited) {
            return;
        }

        this._inited = true;

        var $node = $('.page_' + this.id);
        if ($node.length) {
            this.$node = $node;
        } else {
            if (_.isFunction(window[this.id])) {
                this.$node = $(window[this.id](this.model)).appendTo($('body'));
            } else {
                console.error('Can\'t construct page. There is neither a node in html nor a template constructor');
            }
        }
    };

    App.Page.prototype.load = function load() {
        this.$node.addClass('with-transition').removeClass('transparent');
    };

    App.Page.prototype.unload = function unload() {
        this.$node.removeClass('with-transition').addClass('transparent');
    };

    /*App.Page.prototype.resolveOnAnimationEnd = function() {
        var that = this;

        that.$node.one('transitionend mozTransitionEnd webkitTransitionEnd oTransitonEnd', function() {
            that.deferred.resolve();
        });
    };*/

    App.Page.prototype.getUrl = function() {
        var fragment = this.id;
        if (this.url) {
            fragment = this.url;
        }

        return App.baseUrl + fragment;
    };
})();
