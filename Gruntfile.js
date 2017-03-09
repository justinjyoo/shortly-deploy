module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';'
      },
      js: {
        src: ['server.js', 'server-config.js', './app/*.js', './app/**/*.js', './lib/*.js', './public/client/*.js'],
        dest: 'dist/<%= pkg.name %>.min.js'
      },
      css: {
        src: ['./public/*.css'],
        dest: 'dist/<%= pkg.name %>.min.css'
      }
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    },

    nodemon: {
      dev: {
        script: 'server.js'
      }
    },

    uglify: {
      // option: {
      //   // the banner is inserted at the top of the output
      //   banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      // },
      js: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['<%= concat.js.dest %>']
        }
      }
      // css: {
      //   files: {
      //     'dist/<%= pkg.name %>.min.css': ['<% concat.css.dest %>']
      //   }
      // }
    },

    eslint: {
      target: [
        // Add list of files to lint here
        'dist/<%= pkg.name %>.min.js'
      ]
    },

    cssmin: {
    },

    watch: {
      scripts: {
        files: [
          'public/client/**/*.js',
          'public/lib/**/*.js',
        ],
        tasks: [
          'concat',
          'uglify'
        ]
      },
      css: {
        files: 'public/*.css',
        tasks: ['cssmin']
      }
    },

    shell: {
      prodServer: {
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-nodemon');

  grunt.registerTask('server-dev', function (target) {
    grunt.task.run([ 'nodemon', 'watch' ]);
  });

  ////////////////////////////////////////////////////
  // Main grunt tasks
  ////////////////////////////////////////////////////

  grunt.registerTask('test', [
    'eslint', 'mochaTest'
  ]);

  grunt.registerTask('build', [
    'concat:js', 'concat:css', 'uglify:js'
  ]);

  grunt.registerTask('upload', function(n) {
    if (grunt.option('prod')) {
      // add your production server task here
    } else {
      grunt.task.run([ 'server-dev' ]);
    }
  });

  grunt.registerTask('deploy', [
    // add your deploy tasks here
  ]);


};
