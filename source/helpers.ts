/**
 * Convert CamelCasedString to camel-cased-string
 */
export function toDashed(string: string): string {
    return string.replace(/([A-Z])/, result => `-${result[0].toLowerCase()}`)
}

/**
 * Replace :tokens with actually data
 */
export function tokenizer(string: string | string[], replacements, identifier: '::'): string[] {

    if (!Array.isArray(string)) {
        string = [string]
    }

    return string.map(source => {

        if (typeof source === 'function') {

            let name = source['name'];

            source = source(replacements)

            if (typeof source !== 'string') {
                throw new Error(`${name}: should return a string, returned ${typeof source} instead.`)
            }

        }

        for (let key in replacements) {
            source = source.replace(new RegExp(identifier + key, 'g'), replacements[key])
        }

        return source;

    })

}
