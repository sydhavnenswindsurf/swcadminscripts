//gulp ceremony
var	 gulp = require('gulp');
var p = require('gulp-load-plugins')();
var vinylpaths = require('vinyl-paths');
var del = require('del');
var livereload= require('gulp-livereload');
//configuration

var currentAppToWorkOn  = {
	appDirectory: 'kontingentrapportapp'
};
var tsProject = p.typescript.createProject('tsconfig.json');

var typeScriptFilesGlob = ['*/src/**/*.ts'];

var filesToWatch = typeScriptFilesGlob
	.concat([currentAppToWorkOn.appDirectory + '/**/*.html',"!" + currentAppToWorkOn.appDirectory + "/**/*.clientjs.html"]);

var defaultTaskSpec = ['tsc','creategsajs']; 

var tasksToRunOnWatch = defaultTaskSpec
	.concat(['sync-currentApp']);

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
	//livereload.listen({ reloadPage: currentAppToWorkOn.liveReloadUrl });
	livereload.listen();
	gulp.watch(filesToWatch, tasksToRunOnWatch);
});

gulp.task('sync-currentApp', defaultTaskSpec, function(){
	var reportOptions = {
		err: true, // default = true, false means don't write err 
		stderr: true, // default = true, false means don't write stderr 
		stdout: true // default = true, false means don't write stdout 
	  }
	//process.chdir('FacebookAdminApp');
	return gulp.src(currentAppToWorkOn.appDirectory)
	.pipe(p.exec('cd ' + currentAppToWorkOn.appDirectory +' && gapps push'))
	.on('end',function(){ p.util.log("Pushed "+currentAppToWorkOn.appDirectory+" to google drive...")})
	.pipe(p.exec.reporter(reportOptions))
	.pipe(livereload())
	;
	
});


gulp.task('default', defaultTaskSpec);
