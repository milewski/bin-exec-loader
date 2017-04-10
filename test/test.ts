import { default as loader } from "../source/loader";
import * as fs from "fs-extra";
import * as path from "path";

const resource = path.resolve(__dirname, 'sample-files/sample.png');
const samplePNG = fs.readFileSync(resource)

function cleanUp() {
    try {
        fs.removeSync(path.resolve(__dirname, 'artifacts'))
    } catch (e) {
        // do nothing
    }
}

describe('Loader', () => {

    before(() => cleanUp())
    // after(() => cleanUp())

    it('should works', done => {

        let context = {
            loader, resource,
            query: {
                binary: 'convert',
                quote: false,
                args: {
                    $: [':input', ':output.jpg']
                    // $: 'https://api.tinify.com/shrink',
                    // user: 'api:wk-FPBimcPePLmB7CcgWAJwhcIOGwyaP',
                    // dataBinary: '@:input',
                    // output: ':output'
                }
            },
            async(){
                return (error, buffer) => {

                    if (error) return done(error);

                    done()

                }
            }
        }

        context.loader(samplePNG)

    });

})
