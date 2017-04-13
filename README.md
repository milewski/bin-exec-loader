# bin-exec-loader

[![Build Status](https://travis-ci.org/Milewski/bin-exec-loader.svg?branch=master)](https://travis-ci.org/Milewski/bin-exec-loader)
[![npm version](https://badge.fury.io/js/bin-exec-loader.svg)](https://badge.fury.io/js/bin-exec-loader)
[![npm downloads](https://img.shields.io/npm/dm/bin-exec-loader.svg)](https://www.npmjs.com/package/bin-exec-loader)
[![dependencies](https://david-dm.org/Milewski/bin-exec-loader.svg)](https://www.npmjs.com/package/bin-exec-loader)

## Install

```bash
$ npm install bin-exec-loader --save
```

## Usage

In your `webpack.config.js` add the bin-exec-loader

#### Example

Let's say you would like to use imageagick [`convert`](https://www.imagemagick.org/script/convert.php) to scale all your images down by 50%

In plain bash you would do like this:

```bash
$ convert input/image.png -resize 50% output/image.png
```

Then if you wish to execute the same command but as a webpack-loader you would do:

```js
module: {
    rules: [
        {
            test: /\.(png|jpg|gif)$/,
            use: [
                { loader: 'file-loader', options: { name: '[name].[ext]' } },
                {
                    loader: 'bin-exec-loader',
                    options: {
                        binary: 'convert',
                        prefix: '-', // because imageagick uses an uncommon syntax -like-this --instead-of-this
                        args: {
                            $1: '[input]', // [input] will be replaced by the current file that is being proceed
                            resize: '50%',
                            $2: '[output]' // [output] will be where your output get's temporarily written
                        }
                    }
                }
            ]
        }
    ]
}
```

How about a loader over http? optimizing your image using [tinypng](https://tinypng.com/developers/reference) api?

```bash
$ curl --user api:YOUR_API_KEY --data-binary @unoptimized.png https://api.tinify.com/shrink
```

```js
{
    test: /\.(png|jpg|gif)$/,
    use: 'bin-exec-loader',
    options: {
        binary: 'curl',
        export: true,
        args: {
            user: 'api:YOUR_API_KEY',
            dataBinary: '@[input]',
            $0: 'https://api.tinify.com/shrink'
        }
    }
}
```

Then in some of if the files in your bundle..

```js
const file = require('some-file.png')

console.log(file);

/**
{
  "input": {
    "size": 826071,
    "type": "image/png"
  },
  "output": {
    "size": 183477,
    "type": "image/png",
    "width": 1000,
    "height": 665,
    "ratio": 0.2221,
    "url": "https://api.tinify.com/output/sau7d5debbhlrtae.png"
  }
}
**/
```

## Options

<table>
  <tr>
    <th align="left">Options</th>
    <th align="left">type</th>
    <th align="left">default</th>
    <th align="left">description</th>
  </tr>
  <tr>
    <td>binary</td>
    <td>string</td>
    <td>-</td>
    <td>The binary you want to execute, could be a string to some executable available in your PATH or a npm module.</td>
  </tr>
  <tr>
    <td>export</td>
    <td>boolean</td>
    <td>false</td>
    <td>Determines if the output should be read from the `[output]` placeholder or it should be exported as an string</td>
  </tr>
  <tr>
    <td>quote</td>
    <td>boolean</td>
    <td>false</td>
    <td>Whether the params should be wrapped with quotes `--param "one"`</td>
  </tr>
  <tr>
    <td>equals</td>
    <td>boolean</td>
    <td>false</td>
    <td>Whether the params should be assigned with a equal sign `--param=one`</td>
  </tr>
  <tr>
    <td>emitFile</td>
    <td>boolean</td>
    <td>true</td>
    <td>Whether if the output should be emitted</td>
  </tr>
  <tr>
    <td>name</td>
    <td>string</td>
    <td>[name].[ext]</td>
    <td>The output file name, you can use `[name]`,`[hash]`,`[ext]`</td>
  </tr>
  <tr>
    <td>prefix</td>
    <td style="white-space: nowrap">string | function</td>
    <td>standard</td>
    <td>The prefix used to on the args key. `standard` will act like most CLI does, single letter gets `-` more than one gets `--` however if the CLI you are using has a different pattern you can set here</td>
  </tr>
  <tr>
    <td>enable</td>
    <td>boolean</td>
    <td>true</td>
    <td>Enable/Disable this loader, good to use when you don't want to run it on `process.env.NODE_ENV=== development` for example.</td>
  </tr>
  <tr>
    <td>cache</td>
    <td>boolean</td>
    <td>true</td>
    <td>Tell webpack if the output of this loader should be cached.</td>
  </tr>
  <tr>
    <td>args</td>
    <td>object</td>
    <td>{}</td>
    <td>The args you want to invoke your command with.<br>- `$` will be replaced `-`<br>- `$$` will be replaced with `--`<br>- `$0...∞` will be removed. e.g `{ $1: "hello", $2: "world" }` will become `my-cli hello world`<br><br>you also can use `[input]` and `[output]` on the values as placeholders for the the real resource path. e.g `{$0:"[input]"}` will become `open an/absolute/path/file.extension`<br></td>
  </tr>
</table>

## License 

[MIT](LICENSE)
