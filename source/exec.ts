import { tokenizer } from "./helpers";
import * as fs from "fs";
import * as exec from "execa";
import * as tempWrite from "temp-write";
import * as path from "path";

/**
 * --$123... or -$1...
 */
function stripeOutDollars(srt) {
    return !srt.match(/^(-?)+\$(\d+)?$/)
}

export function execBuffer({ input, binary, resource, extension, args, token }) {

    if (!Buffer.isBuffer(input)) {
        return Promise.reject(new Error('Input is must to be a buffer'));
    }

    let file = path.parse(resource)

    if (typeof extension === 'function') {
        extension = extension({ ...file })
    }

    let params = {
        input: tempWrite.sync(input, file.base),
        output: tempWrite.sync(null, file.base.replace(/\.[^.]+$/, extension || file.ext))
    }

    let options = tokenizer(args, params, token).filter(stripeOutDollars);

    return exec(binary, options)
        .then(result => {
            return new Promise(resolve => {
                fs.readFile(params.output, (error, data) => {
                    if (error) throw error
                    resolve({ data, extension: path.parse(params.output).ext })
                })
            })
        }).catch(e => {
            console.log(e)
        })

}
//
// module.exports = opts => {
//
//     opts = Object.assign({}, opts);
//
//     if (!Buffer.isBuffer(opts.input)) {
//         return Promise.reject(new Error('Input is required'));
//     }
//
//     if (typeof opts.bin !== 'string') {
//         return Promise.reject(new Error('Binary is required'));
//     }
//
//     if (!Array.isArray(opts.args)) {
//         return Promise.reject(new Error('Arguments are required'));
//     }
//
//     const inputPath = tempfile();
//     const outputPath = tempfile();
//
//     opts.args = opts.args.map(x => x === input ? inputPath : x === output ? outputPath : x);
//
//     const promise = fsP.writeFile(inputPath, opts.input)
//         .then(() => execa(opts.bin, opts.args))
//         .then(() => fsP.readFile(outputPath));
//
//     return pFinally(promise, () => Promise.all([
//         rmP(inputPath),
//         rmP(outputPath)
//     ]));
// };
//
// module.exports.input = input;
// module.exports.output = output;
