# any-loader

[![Build Status](https://travis-ci.org/Milewski/any-loader.svg?branch=master)](https://travis-ci.org/Milewski/any-loader)
[![npm version](https://badge.fury.io/js/any-loader.svg)](https://badge.fury.io/js/any-loader)
[![npm downloads](https://img.shields.io/npm/dm/any-loader.svg)](https://www.npmjs.com/package/any-loader)
[![dependencies](https://david-dm.org/Milewski/any-loader.svg)](https://www.npmjs.com/package/any-loader)

## Install

```bash
$ npm install any-loader --save
```

## Usage

In your `webpack.config.js` add the any-loader, chained with the [file-loader](https://github.com/webpack/file-loader), [url-loader](https://github.com/webpack/url-loader) or [raw-loader](https://github.com/webpack/raw-loader):

#### Example

Let's say you would like to use imageagick [`convert`](https://www.imagemagick.org/script/convert.php) to scale all your images down by 50%

In plan bash you would do like this:

```bash
$ convert my/image.png -resize 50% my/scalled-image.png
```

Then if you wish to execute the same command but as a webpack-loader you would do:

```js
module: {
    rules: [
        {
            test: /\.(mov|mkv|avi|mp4)$/,
            use: [
                
                /** file-loader | url-loader | raw-loader **/
                { loader: 'file-loader' },
                
                {
                    test: /\.(png|jpg|gif)$/,
                    use: [
                        {loader: 'file-loader', options: {name: '[name].[ext]'}},
                        {
                            loader: require('any-loader'),
                            options: {
                                binary: 'convert',
                                prefix: '-', // because imageagick uses an uncommon syntax -like-this --instead-of-this
                                extension: '.jpg',
                                args: {
                                    $1: '[input]', // [input] will be replaced by the current file that is being proceed
                                    resize: '50%',
                                    $2: '[output]' // [output] will be where your output get's written
                                    // or $2: '[path][name].[ext]'
                                }
                            }
                        }
                    ]
                }
            ]
        }
    ]
}
```
## License 

[MIT](LICENSE)
