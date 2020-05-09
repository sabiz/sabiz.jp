import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import copy from 'rollup-plugin-copy';
import scss from 'rollup-plugin-scss';
import autoPreprocess from 'svelte-preprocess';
import sizes from 'rollup-plugin-sizes';
import command from 'rollup-plugin-command';
import shader from 'rollup-plugin-shader';

const production = !process.env.ROLLUP_WATCH;

export default {
  input: 'src/main.js',
  output: {
    sourcemap: !production,
    format: 'iife',
    name: 'app',
    file: 'dist/bundle.js'
  },
  plugins: [
    svelte({
      dev: !production,
      preprocess: autoPreprocess()
    }),
    copy({
      targets: [
        { src: 'src/static/**/*', dest: 'dist' },
      ]
    }),
    scss({
      output: 'dist/bundle.css',
      failOnError: true
    }),
    resolve({
      browser: true,
      dedupe: ['svelte']
    }),
    commonjs(),
    shader({
      include: ['**/*.vert', '**/*.frag']
    }),
    sizes(),
    command([
      'eslint src --ext svelte,js',
      'stylelint **/*.scss'
    ], {exitOnFail: true}),

    !production && serve(),

    !production && livereload('dist'),

    production && terser()
  ],
  watch: {
    clearScreen: false,
    include: 'src/**'
  }
};

function serve() {
  let started = false;

  return {
    writeBundle() {
      if (!started) {
        started = true;

        require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
          stdio: ['ignore', 'inherit', 'inherit'],
          shell: true
        });
      }
    }
  };
}
