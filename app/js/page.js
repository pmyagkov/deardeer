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

(function() {
    App.ServicePage = function(options) {
        this.super(options);
    };

    App.ServicePage.prototype = new App.Page();
    App.ServicePage.prototype.super = App.Page;

    App.ServicePage.prototype.load = function() {
        this.$node.css('visibility', 'visible').find('.text')
            /*.bacon({
             'type' : 'line',
             'step' : 5,
             'align' : 'right'
             })*/
            .end()
            .addClass('with-transition').removeClass('transparent');
    };
})();

(function() {
    /**
     *
     * @param {Object} options
     * @param {String} options.id
     * @param {Array} [options.model]
     * @constructor
     */
    App.GalleryPage = function(options) {
        this.super(options);

        this._onKeyDown = this._onKeyDown.bind(this);
        this._onArrowClick = this._onArrowClick.bind(this);
        this._onThumbClick = this._onThumbClick.bind(this);
    };

    App.GalleryPage.prototype = new App.Page();
    App.GalleryPage.prototype.super = App.Page;
    var GalleryPage = App.GalleryPage;

    /**
     * Вычисляем размеры и количество превьюшек для галереи и сохраняем их в статические переменные
     */
    App.GalleryPage.prototype.calculateThumbs = function() {
        var height = $('.cover').height();
        var $thumb = this.$node.find('.thumb:first');
        GalleryPage.thumbHeight = $thumb.outerHeight() +
            parseInt($thumb.css('margin-top')) +
            parseInt($thumb.css('margin-bottom'));

        var $thumbs = $('.thumb');
        GalleryPage.thumbsPerRow = Math.floor(height / GalleryPage.thumbHeight);
        $thumbs.eq(GalleryPage.thumbsPerRow).addClass('transparent');

        GalleryPage.thumbsNumber = $thumbs.length;
    };

    /**
     *
     */
    App.GalleryPage.prototype.slideToPhoto = function() {
        // down
        var direction = true;
        var next;
        if (_.isBoolean(id)) {
            direction = id;
            next = this._currentPhoto + (direction ? 1 : -1);
        } else {
            next = id;
            direction = next - this._currentPhoto > 0;
        }

        if (next < 0) {
            next = this.model.photos.length - 1;
        } else if (next > this.model.photos.length - 1) {
            next = 0;
        }

        var $thumbsList = $('.thumbs');
        var $thumbs = $thumbsList.find('> .thumb');
        // если текущая и следующая фотографии находятся в разных раскладках
        var rowNumber = Math.floor(next / GalleryPage.thumbsPerRow);
        if (rowNumber !== Math.floor(this._currentPhoto / GalleryPage.thumbsPerRow)) {
            var thumbsMarginTop = -rowNumber * GalleryPage.thumbHeight * GalleryPage.thumbsPerRow;
            $thumbsList.css('margin-top', thumbsMarginTop + 'px');
            setTimeout(function() {
                // скрываем первую превьюшку в следующем ряду и последнюю в предыдущем
                var selector = [(rowNumber + 1) * GalleryPage.thumbsPerRow, rowNumber * GalleryPage.thumbsPerRow - 1]
                    .map(function(i) { return ':eq(' + i + ')'; })
                    .join(',');
                $thumbs.removeClass('transparent').filter(selector).addClass('transparent');
            }, 200);

        }

        this._currentPhoto = next;

        var marginTop = -next * 100;
        var backgroundPosition = marginTop / 4;
        $('.stories').css({'margin-top': marginTop + 'vh'});
        var $flowers = $('.flowers');
        $flowers.filter('.flowers_front').css({'background-position': '0 ' + backgroundPosition + 'vh'});
        $flowers.filter('.flowers_middle').css({'background-position': '0 ' + (backgroundPosition / 2) + 'vh'});
        $flowers.filter('.flowers_back').css({'background-position': '0 ' + (backgroundPosition / 4) + 'vh'});

        $thumbs.removeClass('current').filter('[data-id=' + next + ']').addClass('current');
    };

    App.GalleryPage.prototype._onKeyDown = function(e) {
        switch(e.which) {
        case 40:
            // go down
            this.slideToPhoto(true);
            break;
        case 38:
            // go up
            this.slideToPhoto(false);
            break;
        default:
            break;
        }
    };

    App.GalleryPage.prototype._onArrowClick = function(e) {
        var direction = $(e.target).closest('.change').is('.down');
        this.slideToPhoto(direction);
    };

    App.GalleryPage.prototype._onThumbClick = function(e) {
        var $target = $(e.target).closest('.thumb');
        var photoId = Number($target.data('id'));

        this.slideToPhoto(photoId);
    };

    App.GalleryPage.prototype.init = function() {
        if (!this._inited) {
            this._currentPhoto = 0;
            this.calculateThumbs();
        }

        this.super.prototype.init.call(this);
    };

    App.GalleryPage.prototype.load = function() {
        this.super.prototype.load.call(this);
        this._bindEvents();
    };

    App.GalleryPage.prototype.unload = function() {
        this._unbindEvents();
        this.super.prototype.unload.call(this);
    };


    App.GalleryPage._bindEvents = function() {
        $('.arrows .change').click(this._onArrowClick);
        $('.thumbs').on('click', '.thumb', this._onThumbClick);
        $(document).keydown(this._onKeyDown);
    };
    App.GalleryPage._unbindEvents = function() {
        $('.arrows .change').off('click', this._onArrowClick);
        $('.thumbs').off('click', '.thumb', this._onThumbClick);
        $(document).off('keydown', this._onKeyDown);
    };

})();
