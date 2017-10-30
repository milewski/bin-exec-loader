import * as calipers from 'calipers'
import { getOptions, interpolateName, parseQuery } from 'loader-utils'
import { toSpawnArgs } from 'options-to-spawn-args'
import * as path from 'path'
import { execBuffer } from './exec'
import { toDashed } from './helpers'
import { OptionsInterface } from './interfaces/OptionsInterface'

export const raw = true
export default function (content) {

    let config = Object.assign({ args: {} }, getOptions(this) || {}),
        query = this.resourceQuery ? parseQuery(this.resourceQuery) : {},
        options: OptionsInterface = Object.assign({
            enable: true,
            quote: false,
            export: false,
            emitFile: true,
            context: this.context,
            regExp: null,
            name: '[name].[ext]',
            prefix: 'standard',
            equals: false,
            cache: true,
            multiple: false,
            args: {}
        })

    if (this.cacheable) this.cacheable(options.cache)

    for (let key in config.args) {
        options.args[ toDashed(key) ] = config.args[ key ]
    }

    if (delete config.args) {
        Object.assign(options, config)
    } else {
        throw new Error('Couldn\'t delete old args...')
    }

    if (options.enable === false) return content

    const callback = this.async()

    const file = path.parse(this.resource)
    const url = interpolateName(this, options.name, { content, context: options.context, regExp: options.regExp })

    /**
     * Replace original name with desired path/filename+extension
     */
    this.resource = path.join(file.dir, url)

    execBuffer({
        input: content,
        binary: options.binary,
        query: query,
        file: url,
        multiple: options.multiple,
        emitFile: options.emitFile,
        args: toSpawnArgs(options.args, { ...options })
    }).then(data => {

        if (data instanceof Array) {

            const instance = calipers('jpeg', 'png', 'gif', 'svg', 'bmp')
            const cache = {}
            const tokens = {
                width: resource => instance.measure(resource).then(({ pages }) => {

                    let { width, height } = pages[ 0 ]

                    cache[ resource ].width = width
                    cache[ resource ].height = height

                    return width

                }),
                height: resource => instance.measure(resource).then(({ pages }) => {

                    let { width, height } = pages[ 0 ]

                    cache[ resource ].width = width
                    cache[ resource ].height = height

                    return height

                })
            }

            const replacer = (name, key, path, file) => {

                if (cache[ path ][ key ])
                    return name.replace(new RegExp(`\\[${key}]`, 'g'), cache[ path ][ key ])

                return tokens[ key ](path).then(() => replacer(name, key, path, file))

            }

            return new Promise(resolve => {

                const promises = data.map(({ name, file, path }) => {

                    cache[ path ] = {}

                    let promise = Promise.resolve(name)

                    for (let key in tokens) {
                        promise = promise.then(entry => replacer(entry, key, path, file))
                    }

                    return promise

                })

                Promise.all(promises).then(resolution => {
                    resolve(data.map(({ path, file }, index) => {
                        return { path, name: resolution[ index ], file }
                    }))
                })

            })


        }

        return data

    }).then(data => {

        /**
         * If it's an array means user has set emitFile as a regExg
         * so it will export all the matched files into an array of paths
         */
        if (data instanceof Array) {

            const paths = data.map(({ name, file }) => {
                return this.emitFile(name, file) || '__PATH__' + name
            })

            data = JSON.stringify(paths).replace(/"__PATH__/g, '__webpack_public_path__ +"')

        } else if (
            (options.emitFile instanceof RegExp && options.emitFile.test(url)) || options.emitFile === true
        ) {
            this.emitFile(url, data)
        }

        if (options.export || options.multiple) {
            return callback(null, `module.exports = ${ data }`)
        }

        callback(null, data)

    }).catch(error => callback(error))

}
