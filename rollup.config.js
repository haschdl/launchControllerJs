import { terser } from 'rollup-plugin-terser'

// Using iife format so that script can be imported using script tag
// Use esm if ES6 modules are needed
export default [{
  input: 'src/LaunchController.js',
  output: {
    file: 'dist/launchcontroller.js',
    format: 'iife',
    name: 'LaunchControllerJS'
  }
},
{
  input: 'src/LaunchPadMini.js',
  output: {
    file: 'dist/launchpadmini.js',
    format: 'iife',
    name: 'LaunchPadMiniJS'
  }
},
{
  input: 'src/LaunchController.js',
  output: {
    file: 'dist/launchcontroller.min.js',
    format: 'iife',
    name: 'LaunchControllerJS'
  },
  plugins: [terser()]
}
]
