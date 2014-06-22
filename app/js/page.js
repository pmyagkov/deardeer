App.Page = function(options) {
    _.extend(this, options);
};

App.Page.prototype.resolveOnAnimationEnd = function() {
    var that = this;

    that.$node.one('transitionend mozTransitionEnd webkitTransitionEnd oTransitonEnd', function() {
        that.deferred.resolve();
    });
};
