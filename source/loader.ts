import { getOptions } from "loader-utils";
import { toSpawnArgs } from "options-to-spawn-args";
import { toDashed } from "./helpers";
import { OptionsInterface } from "./interfaces/OptionsInterface";
import { execBuffer } from "./exec";

export const raw = true;
export default function (content) {

    let config = Object.assign({ args: {} }, getOptions(this) || {}),
        options: OptionsInterface = Object.assign({
            enable: true,
            quote: false,
            prefix: 'standard',
            extension: null,
            equals: false,
            args: {}
        })

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

    execBuffer({
        input: content,
        binary: options.binary,
        resource: this.resource,
        extension: options.extension,
        args: toSpawnArgs(options.args, { ...options }),
    }).then(({ data, extension }) => {
        this.resource = this.resource.replace(/\.[^.]+$/, extension)
        callback(null, data)
    }).catch(error => callback(error));

}
