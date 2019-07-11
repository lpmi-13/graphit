const gulp = require('gulp');
const inject = require('gulp-inject-string');
const terser= require('gulp-terser');
const rename = require('gulp-rename');
const stripDebug = require('gulp-strip-debug');

gulp.task('miniJS', done => {
  gulp.src('./drawing.js')
    // replace file paths for assets
    .pipe(stripDebug())
    .pipe(terser({
      mangle: true
    }))
    .pipe(rename('drawing.min.js'))
    .pipe(gulp.dest('dist/'))
  done();
});

gulp.task('html', done => {
  gulp.src('index.html')
    .pipe(inject.replace(
      'drawing.js',
      'drawing.min.js'
    ))
    .pipe(gulp.dest('dist/'))
  done();
});

gulp.task('copy assets', done => {
  gulp.src(['styles.css', 'background-graph.png'])
    .pipe(gulp.dest('dist/'))
  done();
});

gulp.task('default', gulp.parallel(
  'miniJS',
  'html',
  'copy assets',
  )
);
