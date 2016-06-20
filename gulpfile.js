(function () {
    var gulp = require('gulp'),
        buildPath = './build';

    gulp.plugins = require('gulp-load-plugins')();

    gulp.task('build', function (cb) {
        gulp.src('src/**/*')
            .pipe(gulp.dest(buildPath))
            .on('end', cb);
    });

    gulp.task('test', function (cb) {
        gulp.src('test/**/*.js')
            .pipe(gulp.plugins.jasmine({
                verbose: true
            }))
            .on('end', cb);
    });

    gulp.task('default', ['build']);
})();
