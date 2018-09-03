const gulp = require('gulp');
const sass = require('gulp-sass');

gulp.task('styles', function(){
    gulp.src('public/scss/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./public/css'));
});

gulp.task('default', function(){
    gulp.watch('public/scss/**/*.scss',['styles']);
});