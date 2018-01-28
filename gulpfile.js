var gulp = require("gulp");
var browserify = require("gulp-browserify");
var sass = require('gulp-sass');

var path = require("path");

var resolve = path.resolve;

var srcPath = resolve(__dirname, "src");
var distPath = resolve(__dirname, "dist");

gulp.task("script", function () {
    return gulp.src(resolve(srcPath, "script/index.js"))
        .pipe(browserify({
            debug: !gulp.env.production
        }))
        .pipe(gulp.dest(resolve(distPath)));
});

gulp.task('sass', function () {
    return gulp.src(resolve(srcPath,"style/index.scss"))
        .pipe(sass().on("error", sass.logError))
        .pipe(gulp.dest(resolve(distPath)));
});