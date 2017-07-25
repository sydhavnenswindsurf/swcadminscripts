//gulp ceremony
var	 gulp = require('gulp');
var p = require('gulp-load-plugins')();
var vinylpaths = require('vinyl-paths');
var del = require('del');
var livereload= require('gulp-livereload');
//configuration
var liveReloadUrl = 'https://script.google.com/macros/s/AKfycbwK7SK2V62BdG1yNxzzo444sajqmQ5-uZiV9t00gF0/dev';

var tsProject = p.typescript.createProject('tsconfig.json');

var typeScriptFilesGlob = ['*/src/**/*.ts'];

var filesToWatch = typeScriptFilesGlob
	.concat(['FacebookAdminApp/**/main.html']);

var defaultTaskSpec = ['tsc','creategsajs'];

var tasksToRunOnWatch = defaultTaskSpec
	.concat(['sync-facebookadminapp']);


//Tasks
gulp.task('tsc', function () {
	return tsProject.src()
	   // .pipe(p.sourcemaps.init())
        .pipe(tsProject())
        .js
		.pipe(p.sourcemaps.write('.'))
		.pipe(gulp.dest(function (f) {			
			return f.base; 
		}));
});
gulp.task('creategsajs',['tsc'],function(){    
	gulp.src('**/*.clientjs.js')
	.pipe(p.filelog())
	.pipe(vinylpaths(del))
	.pipe(p.each(function(content, file, callback) {
		var newContent = '<script type="text/javascript"> \n' + content+ '\n</script>'; 
		callback(null, newContent);
	}))
	
	.pipe(p.extReplace('.html'))	
	.pipe(gulp.dest(function (f) {			
		return f.base; 
	}));	
});

gulp.task('watch', function(){
	livereload.listen({reloadPage:liveReloadUrl});
	gulp.watch(filesToWatch, tasksToRunOnWatch);
});

gulp.task('sync-facebookadminapp', defaultTaskSpec, function(){
	var reportOptions = {
		err: true, // default = true, false means don't write err 
		stderr: true, // default = true, false means don't write stderr 
		stdout: true // default = true, false means don't write stdout 
	  }
//	process.chdir('FacebookAdminApp');
	return gulp.src('FacebookAdminApp')
	.pipe(p.exec('cd FacebookAdminApp && gapps push'))
	.on('end',function(){ p.util.log("Pushed FacebookAdminApp to google drive...")})
	.pipe(p.exec.reporter(reportOptions))
	.pipe(livereload())
	;
	
});


gulp.task('default', defaultTaskSpec);
