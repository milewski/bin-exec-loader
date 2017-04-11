import { default as loader } from "../source/loader";
import * as fs from "fs-extra";
import * as path from "path";
import * as expect from "expect.js";

const resource = path.resolve(__dirname, 'sample-files/sample.png');
const samplePNG = fs.readFileSync(resource)
const fileType = require('file-type');

describe('Loader', () => {

    it('should accept all types of supported values on the args object', done => {

        let context = {
            loader, resource,
            query: {
                binary: 'invalid-binary',
                args: {
                    $0: true,
                    $1: 'string',
                    $10: 123,
                    yet: 'another $0 $ a$',
                    way: '$1 to',
                    a: 'great',
                    test: 'test',
                    boolean: false,
                    bool: true
                }
            },
            async(){
                return error => {

                    expect(error.cmd).to.be(
                        'invalid-binary string 123 --yet "another $0 $ a$" --way "$1 to" -a great --test test --boolean false --bool'
                    )

                    expect(error.code).to.be('ENOENT')

                    done()

                }
            }
        }

        context.loader(samplePNG)

    })

    it('should throw if binary is invalid', done => {

        let context = {
            loader, resource,
            query: {
                binary: 'invalid-binary',
                args: {
                    test: 123
                }
            },
            async(){
                return error => {
                    expect(error.cmd).to.be('invalid-binary --test 123')
                    expect(error.code).to.be('ENOENT')
                    expect(error.spawnargs).to.eql(['--test', 123])
                    done()
                }
            }
        }

        context.loader(samplePNG)

    })

    it('should work system binaries', done => {

        let context = {
            loader, resource,
            query: {
                binary: 'convert',
                prefix: '-',
                args: {
                    $1: '[input]',
                    resize: '50%',
                    $2: '[path]test-[name].gif'
                }
            },
            async(){
                return (error, buffer: Buffer) => {

                    if (error) return done(error);

                    expect(fileType(buffer).ext).to.be('gif')
                    expect(buffer.byteLength).to.be.below(samplePNG.byteLength)

                    done()

                }
            }
        }

        context.loader(samplePNG)

    });

    it('should accept npm modules as well', done => {

        let context = {
            loader, resource,
            query: {
                binary: require('pngquant-bin'),
                args: {
                    force: true,
                    output: '[output]',
                    quality: '60',
                    $$: '[input]'
                }
            },
            async(){
                return (error, buffer: Buffer) => {

                    if (error) return done(error);

                    expect(fileType(buffer).ext).to.be('png')
                    expect(buffer.byteLength).to.be.below(samplePNG.byteLength)

                    done()

                }
            }
        }

        context.loader(samplePNG)

    });

    it('should work with node scripts', done => {

        let context = {
            loader, resource,
            query: {
                binary: require.resolve('./sample-files/copy-cat'),
                args: {
                    input: '[input]',
                    output: '[output]'
                }
            },
            async(){
                return (error, buffer: Buffer) => {

                    if (error) return done(error);

                    expect(fileType(buffer).ext).to.be('png')
                    expect(buffer).to.eql(samplePNG)

                    done()

                }
            }
        }

        context.loader(samplePNG)

    });

    it('should allow to change extension', done => {

        let context = {
            loader, resource,
            query: {
                binary: 'convert',
                prefix: '-',
                extension: 'jpg',
                args: {
                    $1: '[input]',
                    resize: '50%',
                    $2: '[output].[ext]'
                }
            },
            async(){
                return (error, buffer: Buffer) => {

                    if (error) return done(error);

                    expect(fileType(buffer).ext).to.be('jpg')
                    expect(buffer.byteLength).to.be.below(samplePNG.byteLength)

                    done()

                }
            }
        }

        context.loader(samplePNG)

    });

})
