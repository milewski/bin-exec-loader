import { parseDollars, stripeOutDollars, tokenizer } from "./helpers";
import { interpolateName } from "loader-utils";
import * as fs from "fs";
import * as exec from "execa";
import * as tempWrite from "temp-write";
import * as path from "path";

export function execBuffer({ input, binary, query, file, args }) {

    if (!Buffer.isBuffer(input)) {
        return Promise.reject(new Error('Input is must to be a buffer'));
    }

    /**
     * If it's a function resolve things locally
     */
    if (typeof binary !== 'string') {
        return Promise.reject(new Error('Binary should be a string or an absolute path to an executable file.'));
    }

    const params = Object.assign({
        input: tempWrite.sync(input, file.base),
        output: tempWrite.sync(null, file)
    }, query)

    let options = tokenizer(args, params).filter(stripeOutDollars).map(parseDollars);

    return exec(binary, options)
        .then(({ stdout }) => {
            return new Promise(resolve => {

                /**
                 * Get the final output
                 */
                const output = options
                    .filter(option => option.includes(path.parse(params.output).dir))
                    .pop()

                if (output) {

                    fs.readFile(output, (error, data) => {
                        if (error) throw error
                        resolve(data)
                    })

                } else {
                    resolve(stdout)
                }

            })

        })

}
