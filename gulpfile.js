var gulp = require('gulp');
var stylus = require('gulp-stylus');
var jade = require('gulp-jade');
var concat = require('gulp-concat');
var include = require('gulp-file-include');
var sequence = require('run-sequence');
var debug = require('gulp-debug');
var autoprefixer = require('gulp-autoprefixer');

var paths = {
    'styl': { dir: 'app/styl/', glob: 'app/styl/*.styl'},
    'jade': { dir: 'app/jade/', glob: 'app/jade/*.jade'}
};

gulp.task('styl', function() {
    gulp.src(paths.styl.glob)
        .pipe(stylus())
        .pipe(autoprefixer())
        .pipe(gulp.dest(paths.styl.dir));
});


gulp.task('jade', function() {
    return gulp.src(paths.jade.glob)
        //.pipe(debug({verbose: true}))
        .pipe(jade())
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
    gulp.watch(paths.styl.glob, ['styl']);
    gulp.watch([paths.jade.glob, 'app/images/*.svg'], ['html']);
    gulp.watch('gulpfile.js', ['default']);
});

gulp.task('default', ['html', 'styl', 'watch']);
