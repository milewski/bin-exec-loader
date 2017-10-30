#!/usr/bin/env node

const fs = require('fs')

fs.readFileSync(__dirname + '/sample.png')

let input = process.argv[ 3 ]
let output = process.argv[ 5 ]

try {
    fs.writeFileSync(output, fs.readFileSync(input))
} catch (e) {
    throw new Error(e)
}
