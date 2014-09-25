(function() {
    App.ServicesPage = function(options) {
        this.super(options);
    };

    App.ServicesPage.prototype = new App.Page();
    App.ServicesPage.prototype.super = App.Page;

    /**
     * @overrides
     */
    App.ServicesPage.prototype.init = function() {
        this.super.prototype.init.call(this);

        this.$node.find('.photo').click(function(e) {
            var fragment = $(e.currentTarget).data('fragment');
            location.hash = fragment;
        });
    };

})();
