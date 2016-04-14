var gulp = require('gulp');
var jade = require('gulp-jade');

gulp.task('templates', function() {

	gulp.src('./index.jade')
		.pipe(jade())
		.pipe(gulp.dest('./'));

});

gulp.task('watch', function () {
	gulp.watch(['./index.jade'], ['templates']);
});

gulp.task('default', ['watch']);