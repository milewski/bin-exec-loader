import * as expect from 'expect.js'
import * as fileType from 'file-type'
import * as fs from 'fs-extra'
import { runLoaders } from 'loader-runner'
import * as path from 'path'
import * as queryString from 'querystring'

function cleanUp() {
    try {
        fs.removeSync(path.resolve(__dirname, 'temp'))
    } catch (e) {
        // do nothing
    }
}

function runner(options, callback: Function, { file = 'sample.png', query = null } = {}) {
    runLoaders({
            readResource: fs.readFile.bind(fs),
            resource: path.resolve(__dirname, `sample-files/${file}${query ? `?${queryString.stringify(query)}` : ''}`),
            context: {
                emitFile: (name, buffer) => {
                    fs.ensureDirSync(path.resolve(__dirname, 'temp', path.dirname(name)))
                    fs.writeFileSync(path.resolve(__dirname, 'temp', name), buffer, { encoding: 'utf8' })
                }
            },
            loaders: [
                { loader: path.resolve(__dirname, '../source/loader'), options }
            ]
        },
        (error, { resourceBuffer, result }) => {
            if (!error) expect(result).to.have.length(1)
            callback({ error, input: resourceBuffer, output: result ? result[ 0 ] : null })
        }
    )
}

describe('Loader', () => {

    afterEach(() => cleanUp())

    it('should accept all types of supported values on the args object', done => {

        runner({
            binary: 'i-bin',
            args: {
                $0: true,
                $1: 'srt',
                $10: 123,
                yet: 'a $0 $ a$',
                way: '$1 to',
                a: 'great',
                test: 'test',
                b: false,
                bool: true
            }
        }, ({ error }) => {

            expect(error.cmd).to.be('i-bin srt 123 --yet "a $0 $ a$" --way "$1 to" -a great --test test -b false --bool')
            expect(error.code).to.be('ENOENT')

            done()

        })

    })

    it('should throw if binary is invalid', done => {

        runner({
            binary: 'invalid-binary',
            args: {
                test: 123
            }
        }, ({ error }) => {

            expect(error.cmd).to.be('invalid-binary --test 123')
            expect(error.code).to.be('ENOENT')

            done()

        })

    })

    it('should work system binaries', done => {

        runner({
            binary: 'convert',
            prefix: '-',
            name: '[name].gif',
            args: {
                $1: '[input]',
                resize: '50%',
                $2: '[output]'
            }
        }, ({ error, input, output }) => {

            if (error) return done(error)

            expect(fileType(output).ext).to.be('gif')
            expect(output.byteLength).to.be.below(input.byteLength)

            done()

        })

    })

    it('should accept npm modules as well', done => {

        runner({
            binary: require('pngquant-bin'),
            args: {
                force: true,
                output: '[output]',
                quality: '60',
                $$: '[input]'
            }
        }, ({ error, input, output }) => {

            if (error) return done(error)

            expect(fileType(output).ext).to.be('png')
            expect(output.byteLength).to.be.below(input.byteLength)

            done()

        })

    })

    it('should work with node scripts', done => {

        runner({
            binary: require.resolve('./sample-files/copy-cat'),
            args: { input: '[input]', output: '[output]' }
        }, ({ error, input, output }) => {

            if (error) return done(error)

            expect(fileType(output).ext).to.be('png')
            expect(output).to.eql(input)

            done()

        })

    })

    it('should allow to change extension', done => {

        runner({
            binary: 'convert',
            prefix: '-',
            name: '[name].jpg',
            args: { $1: '[input]', resize: '50%', $2: '[output]' }
        }, ({ error, input, output }) => {

            if (error) return done(error)

            expect(fileType(output).ext).to.be('jpg')
            expect(output.byteLength).to.be.below(input.byteLength)

            done()

        })

    })

    it('should keep the original extension if no extension set', done => {

        runner({
            binary: 'convert',
            prefix: '-',
            args: { $1: '[input]', resize: '50%', $2: '[output]' }
        }, ({ error, input, output }) => {

            if (error) return done(error)

            expect(fileType(output).ext).to.be('png')
            expect(output.byteLength).to.be.below(input.byteLength)

            done()

        })

    })

    it('should emit file correctly', done => {

        runner({
            binary: 'convert',
            prefix: '-',
            name: 'test.json',
            args: { $1: '[input]', resize: '50%', $2: '[output]' }
        }, ({ error, input, output }) => {

            if (error) return done(error)

            expect(output).to.eql(fs.readFileSync(path.resolve(__dirname, 'temp/test.json')))

            done()

        })

    })

    it('should accept a RegExp as emitFile', done => {

        runner({
            binary: 'convert',
            prefix: '-',
            emitFile: /\.json$/,
            name: 'test.json',
            export: false,
            args: { $1: '[input]', resize: '50%', $2: '[output]' }
        }, ({ error, output }) => {

            if (error) return done(error)

            let jsonFile = fs.readFileSync(path.resolve(__dirname, 'temp/test.json')).toString()

            expect(JSON.parse(output)).to.eql(JSON.parse(jsonFile))

            done()

        })

    })

    it('should not emit file if set to not do so', done => {

        runner({
            binary: 'convert',
            prefix: '-',
            name: 'fake.jpg',
            emitFile: false,
            args: { $1: '[input]', resize: '50%', $2: '[output]' }
        }, ({ error, input, output }) => {

            if (error) return done(error)

            expect(() => {
                fs.readFileSync(path.resolve(__dirname, 'temp/fake.jpg'))
            }).to.throwException(/no such file or directory/)

            done()

        })

    })

    it('should allow to export the stdout instead of writing file to disk', done => {

        runner({
            binary: 'convert',
            prefix: '-',
            export: true,
            name: '[name].json',
            args: { $1: '[input]', resize: '50%', $2: '[output]' }
        }, ({ error, output }) => {

            if (error) return done(error)

            expect(output).to.match(/module\.exports/)

            done()

        })

    })

    it('should accept camel cased args', done => {

        runner({
            binary: 'i-bin',
            emitFile: false,
            args: { shouldBeCamelCased: true, normal: true }
        }, ({ error }) => {

            expect(error.cmd).to.match(/i-bin --should-be-camel-cased --normal/)

            done()

        })

    })

    it('should accept a function as prefix', done => {

        runner({
            binary: 'convert',
            prefix: (item) => '-',
            name: 'another-test.json',
            args: { $1: '[input]', resize: '50%', $2: '[output]' }
        }, ({ error, output }) => {

            if (error) return done(error)

            expect(output).to.eql(fs.readFileSync(path.resolve(__dirname, 'temp/another-test.json')))

            done()

        })

    })

    it('should accept a query directly from require', done => {

        runner({
            binary: 'convert',
            prefix: '-',
            args: { $1: '[input]', resize: '[resize]', $2: '[output]' }
        }, ({ error, input, output }) => {

            if (error) return done(error)

            expect(fileType(output).ext).to.be('png')
            expect(output.byteLength).to.be.above(input.byteLength)

            done()

        }, { query: { resize: '200%' } })

    })

    it('should accept a regular expression as emitFile for multiple outputs', done => {

        runner({
            binary: 'convert',
            prefix: '-',
            emitFile: /\d\.jpg$/,
            multiple: true,
            name: 'output.jpg',
            args: { $1: '[input]', $2: '[output]' }
        }, ({ error, output }) => {

            if (error) return done(error)

            expect(output.length).to.be(178)

            done()

        }, { file: 'sample.pdf' })

    })

    it('should works correctly with a very long output path', done => {

        runner({
            binary: 'convert',
            prefix: '-',
            multiple: true,
            name: 'very/deep/directory/output.jpg',
            args: { $1: '[input]', $2: '[output]' }
        }, ({ error, output }) => {

            if (error) return done(error)

            expect(output).to.match(/very.*deep.*directory.*output-\d\.jpg/)

            done()

        }, { file: 'sample.pdf' })

    })

    it('should accept special tokens for image outputs', done => {

        runner({
            binary: 'convert',
            prefix: '-',
            emitFile: /\.jpg$/,
            multiple: true,
            name: '[width]-output-[width]x[height]x[height].jpg',
            args: { $1: '[input]', $2: '[output]' }
        }, ({ error }) => {

            if (error) return done(error)

            const files = fs.readdirSync(path.resolve(__dirname, 'temp'))

            files.forEach(file => {
                expect(file).to.match(/960-output-960x560x560-\d.jpg$/)
            })

            expect(files).to.have.length(4)

            done()

        }, { file: 'sample.pdf' })

    })

    it('should accept default values for args', done => {

        runner({
            binary: 'convert',
            prefix: '-',
            emitFile: /\.jpg$/,
            name: 'output.jpg',
            args: { alpha: '[beta=test]', resize: '[gama=50%]' }
        }, ({ error }) => {

            expect(error.cmd).to.match(/convert -alpha test -resize 50%$/)

            done()

        }, { query: {} })

    })

})
