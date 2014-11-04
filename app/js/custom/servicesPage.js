(function() {
    var Page = require('./page');

    var ServicesPage = function(params, model) {
        this.super(params, model);
    };

    ServicesPage.prototype = new Page();
    ServicesPage.prototype.super = Page;

    /**
     * @overrides
     */
    ServicesPage.prototype.init = function() {
        this.super.prototype.init.call(this);

        this.$node.find('.photo').click(function(e) {
            var fragment = $(e.currentTarget).data('fragment');
            location.hash = fragment;
        });
    };

    /**
     * @overrides
     */
    ServicesPage.prototype.unload = function(next) {
        var def = $.Deferred();

        var className;
        var delay = 0;
        if (next.id === 'service' && next.params.type) {
            className = 'out_' + next.params.type;
            this.$node.find('.services').addClass(className);
        }

        _.delay(function() {
            this.$node.removeClass('with-transition').addClass('transparent');
            this.$node.find('.services').removeClass(className);
            def.resolve();
        }.bind(this), delay);

        return def.promise();
    };

    module.exports = ServicesPage;

})();
