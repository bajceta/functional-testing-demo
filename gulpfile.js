var gulp = require('gulp');
var gulp_util = require('gulp-util');

gulp.task('default', ['mocha'], function() {
    gulp.watch(['tests/*'], ['mocha']);
});
gulp.task('mocha', function(cb) {
    var exec = require('child_process').exec;

    exec('mocha -G tests/*', function(error, stdout, stderr) {
        gulp_util.log('[mocha:out]', stdout);
        gulp_util.log('[mocha:err]', stderr);
        cb();
    });
});