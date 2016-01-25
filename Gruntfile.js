module.exports = function(grunt) {

  grunt.initConfig({
  pkg: grunt.file.readJSON('package.json'),
  uglify:{
   options:{
     compress:{
     sequences:false
     }
   },
   my_target:{
    files:[{
      expand: true,
      cwd:'public/javascripts/custom',
      src:'**/*.js',
      dest:'public/build/javascripts/custom',
      ext:'.min.js'
      }]
    }
  },

  
    jshint: {
      files: ['Gruntfile.js', 'public/build/javascripts/custom/*.js']
      },
      options:{
      globals:{
       jQuery:true
       }
      },
    watch: {
      files: ['public/**/*'],
      tasks: ['jshint','uglify'],
      options:{spawn:false}
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['jshint','uglify','watch']);

};
