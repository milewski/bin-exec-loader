export interface OptionsInterface {
    enable?: boolean
    quote?: boolean
    binary: string
    export?: boolean
    context?: string
    regExp?: string
    name?: string
    emitFile?: boolean | RegExp,
    multiple: boolean,
    args: {},
    optimize?: boolean
    cache?: boolean
    equals?: boolean
}
