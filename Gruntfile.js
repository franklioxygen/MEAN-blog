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
      cwd:'public/javascripts',
      src:'**/*.js',
      dest:'public/build/javascripts',
      ext:'.min.js'
      },
      {
      expand: true,
      cwd:'public/angular',
      src:'**/*.js',
      dest:'public/build/angular',
      ext:'.min.js'
      }]
    }
  },

cssmin: {
  target: {
    files: [{
      expand: true,
      cwd: 'public/stylesheets',
      src: ['*.less','*.css', '!*.min.css'],
      dest: 'public/build/stylesheets',
      ext: '.min.less'
    }]
  }
},

  
    jshint: {
      files: ['Gruntfile.js', 'public/javascripts/*.js']
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

