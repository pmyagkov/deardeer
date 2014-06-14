var gulp = require('gulp');
var stylus = require('gulp-stylus');
var jade = require('gulp-jade');
var concat = require('gulp-concat');
var include = require('gulp-file-include');
var sequence = require('run-sequence');
var debug = require('gulp-debug');
var autoprefixer = require('gulp-autoprefixer');
var imageResize = require('gulp-image-resize');
var newer = require('gulp-newer');
var rename = require('gulp-rename');
var glob = require('glob');
var _ = require('lodash');
var borschik = require('gulp-borschik');

var path = require('path');
var fs = require('fs');

var q = require('q');

var paths = {
    'js': { dir: 'app/js/', glob: 'app/js/main.js' },
    'styl': { dir: 'app/styl/', glob: 'app/styl/*.styl'},
    'jade': { dir: 'app/jade/', glob: 'app/jade/*.jade'},
    'photos': { dir: 'app/images/photos/', glob: 'app/images/photos/*.jpg'}
};

function thumbs() {
    var resizeOptions = {
        width: 150,
        height: 100,
        crop: false,
        upscale: false
    };

    return gulp.src(paths.photos.dir + '*/original.jpg')
        .pipe(imageResize(resizeOptions))
        .pipe(rename(function(path) {
            path.basename = "thumb";
        }))
        .pipe(gulp.dest(paths.photos.dir));
}

var readdir = q.denodeify(fs.readdir);
var writeFile = q.denodeify(fs.writeFile);
var readFile = q.denodeify(fs.writeFile);
var stat = q.denodeify(fs.stat);

var writeError = function(err) {
    console.error(err);
};

function processPhotoStat(filePath, stat) {
    //console.log('Processing photo stat');

    var result = {};

    if (stat && stat.isFile()) {
        var ext = path.extname(filePath);
        //console.log('ext: ' + ext);
        // это картинка?
        if (/\.jpeg|jpg|png/.test(ext)) {
            var fileName = path.basename(filePath, ext);
            result[fileName] = filePath;

        } else {
            console.error(filePath + ' is not an image!');
        }

    } else {
        console.error(filePath + ' is not a file!');
    }

    //console.log('resultObj: ' + JSON.stringify(result));

    return result;
}

function extractPhotoDirectory(promoDir) {
    //console.log('extracting photo directory');

    return readdir(promoDir).then(function(list) {
        var photosDef = q.defer();

        var photosObj = {};

        var deferreds = list.map(function(file) {
            var filePath = path.join(promoDir, file);
            return stat(filePath).then(function(stat) {
                var def = q.defer();

                _.extend(photosObj, processPhotoStat(filePath, stat));
                def.resolve();

                return def.promise;
            });
        }, writeError);

        q.all(deferreds).done(function() {
            //console.log('photosObj: ' + JSON.stringify(photosObj));
            photosDef.resolve(photosObj);
        });

        return photosDef.promise;

    }, writeError);
}

gulp.task('photos.json', function() {

    return readdir(paths.photos.dir).then(function(list) {
        var foldersDef = q.defer();

        var foldersArr = [];

        var deferreds = list.map(function(file) {
            var folderDef = q.defer();

            var filePath = path.join(paths.photos.dir, file);
            stat(filePath).then(function(stat) {
                if (stat && stat.isDirectory()) {
                    extractPhotoDirectory(filePath).then(function(obj) {
                        foldersArr.push(obj);

                        folderDef.resolve();
                    });
                } else {
                    console.log(path + ' is not a dir');

                    folderDef.resolve();
                }
            });

            return folderDef.promise;
        });

        q.all(deferreds).done(function() {
            var jsoned = JSON.stringify(foldersArr);
            //console.log('foldersArr: ' + jsoned);

            writeFile(path.join(paths.photos.dir, 'photos.json'), jsoned).then(function() {
                foldersDef.resolve();
                //console.log('photos.json written');
            }, writeError);
        });

        return foldersDef.promise;
    }, writeError);

});

gulp.task('js', ['photos.json'], function() {
    gulp.src(paths.js.glob)
        .pipe(borschik({minimize: false, tech: 'js'}))
        .pipe(rename(function(path) {
            path.basename = "_main";
        }))
        .pipe(gulp.dest(paths.js.dir));
});

gulp.task('normalize image', function() {
    glob(paths.photos.glob, {debug: false}, function (er, files) {
        files.forEach(function(file) {
            var basename = path.basename(file, '.jpg');
            var dirPath = path.join(paths.photos.dir, basename);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath);
            }

            // moving files
            fs.renameSync(file, path.join(dirPath, 'original.jpg'));
        });
    });
});


gulp.task('test2', function() {
    var def = q.defer();

    def.promise.then(function() {
        var def2 = q.defer();

        setTimeout(function() {
            def2.resolve([1, 2]);
        }, 3000);

        return def2.promise;
    }).then(function(a) {
         console.log('a: ' + JSON.stringify(a));
    });

    def.resolve();

});

gulp.task('thumbs', function() {
    thumbs();
});


/*
gulp.task('image', function() {




    return gulp.src(paths.photos.glob)
        .pipe(newer)

});
*/

gulp.task('styl', ['photos.json'], function() {
    var photos = getPhotosJson();

    return gulp.src(paths.styl.glob)
        .pipe(stylus({
            define: {
                '$photos_count': photos.length
            }
        }))
        .pipe(autoprefixer())
        .pipe(gulp.dest(paths.styl.dir));
});


function getPhotosJson() {
    return fs.readFileSync(path.join(paths.photos.dir, 'photos.json'), {encoding: 'utf-8'});
}

gulp.task('jade', ['photos.json'], function() {
    var data = getPhotosJson();

    var photosObj = JSON.parse(data);

    gulp.src(paths.jade.glob)
        .pipe(jade({locals: {photos: photosObj}}))
        .pipe(gulp.dest(paths.jade.dir));

});


gulp.task('html-include', function() {
    return gulp.src([paths.jade.dir + 'index.html'])
        //.pipe(debug({verbose: true}))
        .pipe(include('@@'))
        .pipe(gulp.dest('app/'));
});

gulp.task('html', function() {
    sequence('jade', 'html-include');
});

gulp.task('watch', function() {
    var photosWatchGlob = [paths.photos.dir + '/*', paths.photos.dir + '/**/*', '!' + paths.photos.dir + '/photos.json'];

    gulp.watch(paths.js.glob, ['js']);
    gulp.watch(paths.styl.glob, ['styl']);
    gulp.watch([paths.jade.glob, 'app/images/*.svg'], ['html']);
    gulp.watch(photosWatchGlob, ['js', 'html']);
    // здесь нужно перезапускать процесс gulp'a по изменению gulpfile
    //gulp.watch('gulpfile.js', ['default']);
});

gulp.task('default', ['js', 'html', 'styl', 'watch']);
