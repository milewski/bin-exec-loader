import * as exec from 'execa'
import * as fs from 'fs-extra'
import { interpolateName } from 'loader-utils'
import * as path from 'path'
import * as tempWrite from 'temp-write'
import { ensureDir, parseDollars, stripeOutDollars, tokenizer } from './helpers'

export function execBuffer({ input, binary, query, file, multiple, emitFile, args }) {

    if (!Buffer.isBuffer(input)) {
        return Promise.reject(new Error('Input is must to be a buffer'))
    }

    /**
     * If it's a function resolve things locally
     */
    if (typeof binary !== 'string') {
        return Promise.reject(new Error('Binary should be a string or an absolute path to an executable file.'))
    }

    const params = Object.assign({
        input: tempWrite.sync(input, file),
        output: multiple ? ensureDir(file) : tempWrite.sync(null, file)
    }, query)

    const options = tokenizer(args, params).filter(stripeOutDollars).map(parseDollars)

    return exec(binary, options)
        .then(({ stdout }) => {
            return new Promise(resolve => {

                /**
                 * Get the final output
                 */
                const output = options
                    .filter(option => option.includes(path.dirname(params.output)))
                    .pop()

                if (multiple) {

                    const outDir = path.dirname(output)
                    const files = fs.readdirSync(outDir).map(item => {

                        if (emitFile instanceof RegExp && !emitFile.test(item) || !emitFile) return false

                        const outPath = path.join(outDir, path.basename(item))

                        return {
                            name: path.normalize(path.dirname(file) + path.sep + item),
                            file: fs.readFileSync(outPath),
                            path: outPath
                        }

                    }).filter(Boolean)

                    return resolve(files)

                }

                if (output) {

                    return fs.readFile(output, (error, data) => {
                        if (error) throw error
                        resolve(data)
                    })

                }

                return resolve(stdout)

            })

        })

}
