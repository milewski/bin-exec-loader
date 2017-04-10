# video-loader

[![Build Status](https://travis-ci.org/Milewski/video-loader.svg?branch=master)](https://travis-ci.org/Milewski/video-loader)
[![npm version](https://badge.fury.io/js/video-loader.svg)](https://badge.fury.io/js/video-loader)
[![npm downloads](https://img.shields.io/npm/dm/video-loader.svg)](https://www.npmjs.com/package/video-loader)
[![dependencies](https://david-dm.org/Milewski/video-loader.svg)](https://www.npmjs.com/package/video-loader)

## Install

```bash
$ npm install video-loader --save
```

## Usage

In your `webpack.config.js` add the video-loader, chained with the [file-loader](https://github.com/webpack/file-loader), [url-loader](https://github.com/webpack/url-loader) or [raw-loader](https://github.com/webpack/raw-loader):

```js
module: {
    rules: [
        {
            test: /\.(mov|mkv|avi|mp4)$/,
            use: [
                
                /** file-loader | url-loader | raw-loader **/
                { loader: 'file-loader' },
                
                {
                    loader: 'video-loader',
                    options: {
                        enabled: process.env.NODE_ENV === 'production',
                        format: 'mp4',
                        srtFile: path.resolve(__dirname, 'sample-files/subtitle.srt'),
                        srtLang: 'eng',
                        srtBurn: 1,
                        preset: 'Very Fast 1080p30',
                        optimize: true
                    }
                }
            ]
        }
    ]
}
```
## License 

[MIT](LICENSE)
