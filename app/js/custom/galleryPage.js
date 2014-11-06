(function() {
    var Page = require('./page');

    var MODES = {
        'DESCRIPTION': 'description',
        'GALLERY': 'gallery'
    };

    MODES.DEFAULT = MODES.DESCRIPTION;

    var GalleryPage = function(params, model) {
        this.super(params, model);

        this._onKeyDown = this._onKeyDown.bind(this);
        this._onArrowClick = this._onArrowClick.bind(this);
        this._onThumbClick = this._onThumbClick.bind(this);
    };

    GalleryPage.prototype = new Page();
    GalleryPage.prototype.super = Page;

    GalleryPage.constructKey = function(pageId, params) {
        return decodeURIComponent($.param(_.extend({id: pageId}, _.omit(params, 'gallery'))));
    };

    GalleryPage.prototype.transform = function(params) {
        if (params['gallery']) {
            this._mode = MODES.GALLERY;

            this.$node
                .find('.thumbs-container').removeClass('semi-out').end()
                .find('.description').addClass('out').end()
                .find('.gallery').removeClass('out');
        } else {
            this._mode = MODES.DESCRIPTION;
            this.$node
                .find('.thumbs-container').addClass('semi-out').end()
                .find('.description').removeClass('out').end()
                .find('.gallery').addClass('out');
        }
    };

    /**
     * Вычисляем размеры и количество превьюшек для галереи и сохраняем их в статические переменные
     */
    GalleryPage.prototype.calculateThumbs = function() {
        var height = $('.cover').height() - 40 * 2; // высоты двух стрелок
        var $thumb = this.$node.find('.thumb:first');
        GalleryPage.thumbHeight = $thumb.outerHeight() +
            parseInt($thumb.css('margin-top')) +
            parseInt($thumb.css('margin-bottom'));

        var $thumbs = this.$node.find('.thumb');
        GalleryPage.thumbsPerRow = Math.floor(height / GalleryPage.thumbHeight);
        $thumbs.eq(GalleryPage.thumbsPerRow).addClass('transparent');

        var $thumbsLi = $('.thumbs');
        // двигаем список с фотографиями, чтобы был центрирован относительно рамка
        var offsetTop = (height - GalleryPage.thumbsPerRow * GalleryPage.thumbHeight) / 2;
        $thumbsLi.css('border-top-width', offsetTop);

        GalleryPage.thumbsNumber = $thumbs.length;
    };

    /**
     * Переключает фотографию
     * @param {Number|Boolean} id 0-based index of the photo
     */
    GalleryPage.prototype.slideToPhoto = function(id) {
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

        var $thumbsList = this.$node.find('.thumbs');
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
        this.$node.find('.photos').css({'margin-top': marginTop + 'vh'});

        // двигаем паралакс цветов
        var backgroundPosition = marginTop / 4;
        var $flowers = $('.flowers');
        $flowers.filter('.flowers_front').css({'background-position': '0 ' + backgroundPosition + 'vh'});
        $flowers.filter('.flowers_middle').css({'background-position': '0 ' + (backgroundPosition / 2) + 'vh'});
        $flowers.filter('.flowers_back').css({'background-position': '0 ' + (backgroundPosition / 4) + 'vh'});

        $thumbs.removeClass('current').filter('[data-id=' + next + ']').addClass('current');
    };

    GalleryPage.prototype._onKeyDown = function(e) {
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

    GalleryPage.prototype._onArrowClick = function(e) {
        var $target = $(e.currentTarget);
        var direction = $target.is('.down');
        if ($target.is('.arrows_thumbs *')) {
            var next = this._currentPhoto + (direction ? 1 : -1) * GalleryPage.thumbsPerRow;
        } else {
            next = direction;
        }

        this.slideToPhoto(next);
    };

    GalleryPage.prototype._onThumbClick = function(e) {
        var $target = $(e.target).closest('.thumb');
        var photoId = Number($target.data('id'));

        this.slideToPhoto(photoId);
    };

    GalleryPage.prototype.initState = function() {
        this._mode = MODES.DEFAULT;
        this._currentPhoto = 0;

        this.$node.find('.thumbs > *, .photos > *').removeClass('current');
        // возвращаем маниатюры в исходное состояния
        this.$node.find('.thumbs').css('margin-top', 0)
            .find('> li').removeClass('transparent')
            .eq(GalleryPage.thumbsPerRow).addClass('transparent');

        this.$node.find('.photos').css('margin-top', 0);

        this.calculateThumbs();
    };

    GalleryPage.prototype.init = function() {
        if (!this._inited) {
            this.super.prototype.init.call(this);

            this.initState();

            this.transform(this.params);
        }
    };

    GalleryPage.prototype.load = function() {
        var params = {};

        if (this._mode === MODES.GALLERY) {
            params['gallery'] = true;
        }

        this.transform(params);

        this.super.prototype.load.call(this);
        this._bindEvents();
        this.$node.find('.thumbs-container').removeClass('out');
        this.$node.find('.thumbs > *:eq(0), .photos > *:eq(0)').addClass('current');
    };

    GalleryPage.prototype.unload = function() {
        this._unbindEvents();
        this.$node.find('.thumbs-container').addClass('out');
        this.super.prototype.unload.call(this);

        this.initState();
    };


    GalleryPage.prototype._bindEvents = function() {
        $('.arrows .change').click(this._onArrowClick);
        $('.thumbs').on('click', '.thumb', this._onThumbClick);
        $(document).keydown(this._onKeyDown);
    };
    GalleryPage.prototype._unbindEvents = function() {
        $('.arrows .change').off('click', this._onArrowClick);
        $('.thumbs').off('click', '.thumb', this._onThumbClick);
        $(document).off('keydown', this._onKeyDown);
    };

    module.exports = GalleryPage;

})();
