import {
    describe, 
    test, 
    expect,
    jest
} from '@jest/globals';
import Routes from '../../src/routes.js';
import TestUtil from '../util/testUtil.js';
import { logger } from '../../src/logger.js';
import { UploadHandler } from '../../src/uploadHandler.js';

describe('#Routes test', () => {
    beforeEach(() => {
        jest.spyOn(logger, 'info').mockImplementation()
    })

    const request = TestUtil.generateReadableStream([ 'Some file bytes' ]);
    const response = TestUtil.generateWritableStream(() => {});

    const defaultParams = {
        request: Object.assign(request, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            method: '',
            body: {}
        }),
        response: Object.assign(response, {
            setHeader: jest.fn(),
            writeHead: jest.fn(),
            end: jest.fn(),
        }),
        values: () => Object.values(defaultParams),
    };
    
    describe('#setSocketInstance', () => {

        test('setSocketInstance should store io instance', () => {
            const routes = new Routes();
            const ioObj = {
                to: (id) => inObj,
                emit: (event, message) => {}
            }
            routes.setSocketInstance(ioObj);
            expect(routes.io).toEqual(ioObj);
        })
    })

    describe('#handler', () => {
        test('given an inexistent route it should choosen defaultRoute', () => {
            const routes = new Routes();
            const params = { ...defaultParams };

            params.request.method = 'Inexistent';
            routes.handler(...params.values())
            expect(params.response.end).toHaveBeenCalledWith('Rota inexistent [404]');
        });
        test('it should set any request with CORS enabled', () => {
            const routes = new Routes();
            const params = { ...defaultParams };

            params.request.method = 'Inexistent';
            routes.handler(...params.values());
            expect(params.response.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
        });
        test('given method OPTIONS it should choose options route', async () => {
            const routes = new Routes();
            const params = { ...defaultParams };

            params.request.method = 'OPTIONS';
            await routes.handler(...params.values());
            expect(params.response.end).toHaveBeenCalledWith('Rota options');
            expect(params.response.writeHead).toHaveBeenCalledWith(204);
        });
        test('given method GET it should choose options get', async () => {
            const routes = new Routes();
            const params = { ...defaultParams };

            params.request.method = 'GET';

            jest.spyOn(routes, routes.get.name).mockResolvedValue();

            await routes.handler(...params.values());
            expect(routes.get).toHaveBeenCalled();
        });
        test('given method POST it should choose options post', async () => {
            const routes = new Routes();
            const params = { ...defaultParams };

            params.request.method = 'POST';

            jest.spyOn(routes, routes.post.name).mockResolvedValue();

            await routes.handler(...params.values());
            expect(routes.post).toHaveBeenCalled();
        });
    })

    describe('#get', () => {
        test('given method GET it should list all fields', async () => {
            const route = new Routes();
            const params = {
                ...defaultParams
            }

            const fileStatusesMock = [
                {
                    size: '132 kB',
                    lastModified: '2021-09-06T20:01:23.576Z',
                    owner: 'luisao',
                    file: 'file.png'
                }
            ]
            jest.spyOn(route.fileHelper, route.fileHelper.getFilesStatus.name).mockResolvedValue(fileStatusesMock)

            params.request.method = 'GET';
            await route.handler(...params.values());

            expect(params.response.writeHead).toHaveBeenCalledWith(200)
            expect(params.response.end).toHaveBeenCalledWith(JSON.stringify(fileStatusesMock))
        }) 
    })

    describe('#post', () => {
        test('it should validate post route workflow', async () => {
            const routes = new Routes('/tmp')
            const options = {
                ...defaultParams
            }
            options.request.method = 'POST'
            options.request.url = '?socketId=10' 

                
            jest.spyOn(
                UploadHandler.prototype,
                UploadHandler.prototype.registerEvents.name
            ).mockImplementation((headers, onFinish) => {
                const writable = TestUtil.generateWritableStream(() => {})
                writable.on("finish", onFinish)

                return writable
            })

            await routes.handler(...options.values())

            expect(UploadHandler.prototype.registerEvents).toHaveBeenCalled()
            expect(options.response.writeHead).toHaveBeenCalledWith(200)

            const expectedResult = JSON.stringify({ result: 'Files uploaded with success' })
            expect(options.response.end).toHaveBeenCalledWith(expectedResult)

        })
    })
})