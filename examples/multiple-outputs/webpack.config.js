/**
 * From the root run:
 * webpack --config examples/multiple-outputs/webpack.config.js
 */

const path = require('path')

module.exports = {
    context: __dirname,
    entry: './app.js',
    output: {
        path: __dirname + '/output',
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.pdf$/,
                loader: path.resolve(__dirname, '../../source/loader'), // bin-exec-loader
                options: {
                    binary: 'convert', // Using imagemagick convert [https://www.imagemagick.org/script/convert.php]
                    prefix: '-', // The arguments are prefixed with only one "-". e.g: [convert file.pdf -resize 50% output.png]
                    multiple: true, // Necessary to tell the loader that there will be multiple outputs
                    emitFile: /\.jpg$/, // Within all the outputted files, emit only those which match this pattern
                    name: '[name].jpg', // Set the output name and path, name and extension: [path]/[name].[ext]
                    args: {
                        $1: '[input]', // [input] will be an absolute path of the file written in a temp directory on your system
                        $2: '[output]' // [output] will be replaced by [name].jpg
                    }
                }
            }
        ]
    }
}
