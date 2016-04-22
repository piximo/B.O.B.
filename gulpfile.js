var gulp = require('gulp');
var jade = require('gulp-jade');
var livereload = require('gulp-livereload');
var webserver = require('gulp-webserver');
var sass = require('gulp-sass');
 
gulp.task('scss', function () {
	return gulp.src('./scss/**/*.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest('./css'))
		.pipe(livereload());
});

gulp.task('templates', function() {
	return gulp.src('./index.jade')
		.pipe(jade())
		.pipe(gulp.dest('./'))
		.pipe(livereload());
});

gulp.task('js', function(){
	return gulp.src('./js/*.js')
		.pipe(livereload());
});

gulp.task('webserver', function(){
	gulp.src('./')
		.pipe(webserver());
});

gulp.task('watch', function () {
	livereload.listen();
	gulp.watch('./index.jade', ['templates']);
	gulp.watch('./scss/**/*.scss', ['scss']);
	gulp.watch('./js/*.js', ['js']);
});

gulp.task('default', ['watch', 'webserver']);