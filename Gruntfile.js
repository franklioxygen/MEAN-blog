module.exports = function(grunt) {

  grunt.initConfig({
  pkg: grunt.file.readJSON('package.json'),
  uglify:{
   options:{
     semicolons: false,
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

cssmin: {
  target: {
    files: [{
      expand: true,
      cwd: 'public/stylesheets/custom',
      src: ['*.less','*.css', '!*.min.css'],
      dest: 'public/build/stylesheets/custom',
      ext: '.min.less'
    }]
  }
},

  
    jshint: {
      files: ['Gruntfile.js', 'public/javascripts/custom/*.js']
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
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.registerTask('default', ['jshint','uglify','cssmin','watch']);

};
