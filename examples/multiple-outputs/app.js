/**
 * Require a PDF File and get an array with all pages url
 */
const pages = require('../../test/sample-files/sample.pdf')

for (let page in pages) {
    console.log(page)
}
