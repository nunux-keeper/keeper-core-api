'use strict'

const gulp = require('gulp')
const cucumber = require('gulp-cucumber')
const eslint = require('gulp-eslint')
const todo = require('gulp-todo')
const apidoc = require('gulp-api-doc')

gulp.task('lint', function () {
  return gulp.src('src/**/*.js')
  .pipe(eslint({useEslintrc: true}))
  .pipe(eslint.format())
  .pipe(eslint.failAfterError())
})

gulp.task('test', function () {
  return gulp.src('features/*.feature')
  .pipe(cucumber({
    steps: 'features/step_definitions/*_step_definition.js',
    support: 'features/support/*.js'
  }))
  .once('error', function () {
    process.kill(process.pid, 'SIGINT')
  })
  .once('end', function () {
    process.kill(process.pid, 'SIGTERM')
  })
})

gulp.task('doc', function () {
  return gulp.src('src/api')
  .pipe(apidoc())
  .pipe(gulp.dest('documentation'))
})

gulp.task('todo', function () {
  gulp.src(['src/**/*.js'])
  .pipe(todo())
  .pipe(gulp.dest('./'))
})

gulp.task('install', ['doc'])

gulp.task('default', ['lint', 'todo'], function () {
  gulp.start('test')
})
