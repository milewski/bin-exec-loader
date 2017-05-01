import * as util from "util";
import * as tempy from 'tempy';
import * as path from 'path';
import * as fs from 'fs-extra';

/**
 * Convert CamelCasedString to camel-cased-string
 */
export function toDashed(string: string): string {
    return string.replace(/([A-Z])/g, result => `-${result[0].toLowerCase()}`)
}

/**
 * Scape Regular Expression String
 */
export function escape(string): string {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

/**
 * --$123... or -$1...
 */
export function stripeOutDollars(string: string) {
    return (typeof string === 'string') ? !string.match(/^(-?)+\$(\d+)$/) : true
}

/**
 * -$ --$$ --$$$$$$$...
 * converts to
 *  -   --   -------
 */
export function parseDollars(string: string) {
    return (typeof string === 'string') ? string.replace(/^(-?)+\$|(?=\$+$)./g, '-') : string
}

/**
 * Replace :tokens with actually data
 */
export function tokenizer(args: string | string[], replacements, identifier = '[%s]'): string[] {

    if (!Array.isArray(args)) {
        args = [args]
    }

    const expressions = Object
        .keys(replacements)
        .map(key => [escape(util.format(identifier, key)), replacements[key]])

    return args.map(source => {

        if (typeof source === 'function') {

            let name = source['name'];

            source = source(replacements)

            if (typeof source !== 'string') {
                throw new Error(`${name}: should return a string, returned ${typeof source} instead.`)
            }

        }

        expressions.forEach(([expression, replacement]) => {

            if (typeof replacement === 'function')
                replacement = replacement()

            if (typeof source === 'string')
                source = source.replace(new RegExp(expression, 'g'), replacement)

        })

        return source;

    })

}

/**
 * Ensure temporary directory exists (deep nested)
 */
export function ensureDir(file: string): string {
    const tempDirectory = path.join(tempy.directory(), path.dirname(file))
    fs.ensureDirSync(tempDirectory)
    return path.join(tempDirectory, path.basename(file))
}
