import { getOptions, interpolateName } from "loader-utils";
import { toSpawnArgs } from "options-to-spawn-args";
import { toDashed } from "./helpers";
import { OptionsInterface } from "./interfaces/OptionsInterface";
import { execBuffer } from "./exec";
import * as path from "path";

export const raw = true;
export default function (content) {

    let config = Object.assign({ args: {} }, getOptions(this) || {}),
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
            args: {}
        })

    if (this.cacheable) this.cacheable(options.cache);

    for (let key in config.args) {
        options.args[toDashed(key)] = config.args[key]
    }

    if (delete config.args) {
        Object.assign(options, config)
    } else {
        throw new Error('Couldn\'t delete old args...')
    }

    if (options.enable === false) return content;

    const callback = this.async();

    const file = path.parse(this.resource)
    const url = interpolateName(this, options.name, { content, context: options.context, regExp: options.regExp })

    /**
     * Replace original name with desired path/filename+extension
     */
    this.resource = path.normalize(`${file.dir}/${url}`);

    execBuffer({
        input: content,
        binary: options.binary,
        file: url,
        args: toSpawnArgs(options.args, { ...options }),
    }).then(data => {

        if (options.emitFile)
            this.emitFile(url, data)

        if (options.export) {
            return callback(null, `module.exports = ${ data }`)
        }

        callback(null, data)

    }).catch(error => callback(error));

}
