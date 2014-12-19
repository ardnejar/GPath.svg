/*global module:false*/

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*!\n\
  <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n\
  <%= pkg.homepage %>\n\
  Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n\
  Licensed under <%= pkg.license %> license\n\
*/\n',
    // variables
    concatenate_target: 'distribution/<%= pkg.name.toLowerCase() %>.js',
    // Task configuration.
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      dist: {
        files: {
          '<%= concatenate_target %>': ['source/*.js'],
          '../gpath/js/<%= pkg.name.toLowerCase() %>.js': ['source/*.js']
        }
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        files: {
          'distribution/<%= pkg.name.toLowerCase() %>.min.js': ['<%= concatenate_target %>'],
          '../gpath/js/<%= pkg.name.toLowerCase() %>.min.js': ['<%= concatenate_target %>'],
          '../gpath-ghp/javascripts/<%= pkg.name.toLowerCase() %>.min.js': ['<%= concatenate_target %>']
       }
      }
    },
    jshint: {
      options: {
        asi: true,
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: false,
        newcap: true,
        noarg: true,
        multistr: true,
        laxcomma: true,
        sub: true,
        undef: false,
        unused: false, // TODO: figure out how to make unused cross check all files?
        boss: true,
        eqnull: true,
        browser: true,
        globals: {
          jQuery: true
        }
      },
      uses_defaults: ['source/*.js'],
      gruntfile: {
        src: 'Gruntfile.js'
      }
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task.
  grunt.registerTask('default', ['jshint', 'concat', 'uglify']);

};
