(function() {
    App.Page = function(options) {
        _.extend(this, options);
        this._inited = false;
    };

    App.Page.prototype.init = function() {
        if (this._inited) {
            return;
        }

        if (_.isFunction(window[this.id])) {
            this.$node = $(window[this.id](this.model)).appendTo($('body'));
            this._inited = true;
        }
    };

    App.Page.prototype.load = function load() {
        this.$node.addClass('with-transition').removeClass('transparent');
    };

    App.Page.prototype.unload = function unload() {
        this.$node.addClass('with-transition').removeClass('transparent');
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

(function() {
    App.StoriesPage = function(options) {
        this.super(options);
    };

    App.StoriesPage.prototype = new App.Page();
    App.StoriesPage.prototype.super = App.Page;

    App.StoriesPage.prototype.load = function() {
        this.$node.css('visibility', 'visible');

        this.$node
            .addClass('with-transition').removeClass('transparent')
            .find('.thumbs').removeClass('out');
    };

    App.StoriesPage.prototype.unload =  function() {
        this.$node.find('.thumbs').addClass('out').end()
            .addClass('transparent');
    }

})();

(function() {
    App.StoriesPage = function(options) {
        this.super(options);
    };

    App.StoriesPage.prototype = new App.Page();
    App.StoriesPage.prototype.super = App.Page;

    App.StoriesPage.prototype.load = function() {
        this.$node.css('visibility', 'visible');

        this.$node
            .addClass('with-transition').removeClass('transparent')
            .find('.thumbs').removeClass('out');
    };

    App.StoriesPage.prototype.unload =  function() {
        this.$node.find('.thumbs').addClass('out').end()
            .addClass('transparent');
    };

})();

(function() {
    App.ServicesPage = function(options) {
        this.super(options);
    };

    App.ServicesPage.prototype = new App.Page();
    App.ServicesPage.prototype.super = App.Page;

    App.ServicesPage.prototype.init = function() {
        this.super.proto.init.call(this);

        this.$node.find('.photo').click(function(e) {
            var fragment = $(e.currentTarget).data('fragment');
            location.hash = fragment;
        });
    };

})();
