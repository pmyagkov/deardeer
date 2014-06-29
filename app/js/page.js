App.Page = function(options) {
    _.extend(this, options);

    if (!_.isFunction(this.load)) {
        this.load = commonLoad;
    }

    if (!_.isFunction(options.unload)) {
        this.unload = commonUnload;
    }
};

App.Page.prototype.resolveOnAnimationEnd = function() {
    var that = this;

    that.$node.one('transitionend mozTransitionEnd webkitTransitionEnd oTransitonEnd', function() {
        that.deferred.resolve();
    });
};

function commonLoad() {
    this.$node.css('visibility', 'visible');

    this.$node.addClass('with-transition').removeClass('transparent');
}

function commonUnload() {
    var that = this;
    this.$node.addClass('with-transition').addClass('transparent');

    setTimeout(function() {
        that.$node.css('visibility', 'hidden');
    }, 1000);
}
