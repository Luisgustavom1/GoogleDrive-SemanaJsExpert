import {
    describe, 
    test, 
    expect,
    jest
} from '@jest/globals';
import { UploadHandler } from "../../src/uploadHandler";
import TestUtil from '../../util/testUtil';

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

            const onFinish = jest.fn()
            const busboyInstance = uploadHandler.registerEvents(headers, onFinish)
            
            const fileStream = TestUtil.generateReadableStream(['chuck', 'of', 'data']);
            busboyInstance.emit('file', 'fieldname', fileStream, 'filename.txt')

            busboyInstance.listeners("finish")[0].call();
            
            expect(uploadHandler.onFile).toHaveBeenCalled();
            expect(onFinish).toHaveBeenCalled();
        })
    })
})