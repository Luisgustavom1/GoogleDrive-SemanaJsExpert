import {
    describe, 
    test, 
    expect,
    jest
} from '@jest/globals';
import { UploadHandler } from "../../src/uploadHandler";

describe('#UploadHandler test suite', () => {
    const inObj = {
        to: (id) => inObj,
        emit: (event, message) => {}
    }
    
    describe('#registerEvents', () => {

        test('should call onFile and onFinish functions on Busboy instance', () => {
            const uploadHandler = new UploadHandler({
                io: inObj,
                socketId: '01'
            });

            jest.spyOn(uploadHandler, uploadHandler.onFile.name)
                .mockResolvedValue();

            const headers = {
                'content-type': 'multipart/form-data; boundary='
            };

            const fn = jest.fn()
            uploadHandler.registerEvents(headers, fn)

            expect(uploadHandler.onFile).toHaveBeenCalled();
            expect(fn).toHaveBeenCalled();
        })
    })
})