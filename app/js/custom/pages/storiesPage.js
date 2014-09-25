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
