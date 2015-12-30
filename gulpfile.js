'use strict';

var gulp     = require('gulp'),
    cucumber = require('gulp-cucumber'),
    jshint   = require('gulp-jshint'),
    stylish  = require('jshint-stylish'),
    todo     = require('gulp-todo'),
    apidoc   = require('gulp-api-doc');


gulp.task('lint', function() {
  return gulp.src('src/**/*.js')
  .pipe(jshint())
  .pipe(jshint.reporter(stylish))
  .pipe(jshint.reporter('fail'));
});

gulp.task('test', function() {
  return gulp.src('features/*.feature')
  .pipe(cucumber({
    steps: 'features/step_definitions/*_step_definition.js',
    support: 'features/support/*.js'
  }))
  .once('error', function () {
    process.kill(process.pid, 'SIGINT');
  })
  .once('end', function () {
    process.kill(process.pid, 'SIGTERM');
  });
});

gulp.task('doc', function() {
  return gulp.src('src/api')
  .pipe(apidoc())
  .pipe(gulp.dest('documentation'));
});

gulp.task('todo', function() {
  gulp.src(['src/**/*.js'])
  .pipe(todo())
  .pipe(gulp.dest('./'));
});

gulp.task('install', ['doc']);

gulp.task('default', ['lint', 'todo'], function() {
  gulp.start('test');
});
