import { parseDollars, stripeOutDollars, tokenizer } from "./helpers";
import * as fs from "fs";
import * as exec from "execa";
import * as tempWrite from "temp-write";
import * as path from "path";

export function execBuffer({ input, binary, resource, extension, args }) {

    if (!Buffer.isBuffer(input)) {
        return Promise.reject(new Error('Input is must to be a buffer'));
    }

    /**
     * If it's a function resolve things locally
     */
    if (typeof binary !== 'string') {
        return Promise.reject(new Error('Binary should be a string or an absolute path to an executable file.'));
    }

    let file = path.parse(resource)

    if (typeof extension === 'function') {
        extension = extension({ ...file })
    }

    let cache = {}

    let params = {
        input: tempWrite.sync(input, file.base),
        ext: (extension || file.ext).replace('.', ''),
        name: file.name,
        path: () => cache['path'] || (cache['path'] = path.parse(params.output()).dir + '/'),
        output: () => cache['output'] || (cache['output'] = tempWrite.sync(null, `${params.name}.${params.ext}`))
    }

    let options = tokenizer(args, params).filter(stripeOutDollars).map(parseDollars);

    /**
     * Normalize Paths
     */
    options = options.map(option => {

        if ((typeof option === 'string') && option.includes(params.path())) {
            return path.normalize(option)
        }

        return option;

    })

    return exec(binary, options)
        .then(result => {
            return new Promise(resolve => {

                /**
                 * Get the final output
                 */
                const output = options
                    .filter(option => option.includes(params.path()))
                    .pop()

                if (!output)
                    throw new Error('Invalid Output: ' + JSON.stringify(options))

                fs.readFile(output, (error, data) => {
                    if (error) throw error
                    resolve({ data, extension: path.parse(output).ext })
                })

            })

        })

}
