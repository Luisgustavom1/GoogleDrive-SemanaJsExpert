import {
    describe, 
    test, 
    expect,
    jest
} from '@jest/globals';
import fs from 'fs';
import FileHelper from '../../src/fileHelper';

describe('#File Helper test', () => {

    describe('#getFileStatus', () => {

        test('It should return files statuses in correct format', async () => {
            const statMock = {
                dev: 2925220325,
                mode: 33206,
                nlink: 1,
                uid: 0,
                gid: 0,
                rdev: 0,
                blksize: 4096,
                ino: 20547673300445084,
                size: 132051,
                blocks: 264,
                atimeMs: 1630958752720.879,
                mtimeMs: 1630958565589,
                ctimeMs: 1630958565589.77,
                birthtimeMs: 1630958483575.6235,
                atime: '2021-09-06T20:05:52.721Z',
                mtime: '2021-09-06T20:02:45.589Z',
                ctime: '2021-09-06T20:02:45.590Z',
                birthtime: '2021-09-06T20:01:23.576Z'
            }

            const mockUser = 'luisao';
            process.env.USER = mockUser;
            const filename = 'file.png';

            jest.spyOn(fs.promises, fs.promises.stat.name)
                .mockResolvedValue(statMock);
            
            jest.spyOn(fs.promises, fs.promises.readdir.name)
                .mockResolvedValue([filename])

            const result = await FileHelper.getFilesStatus('/tmp');

            const expectedFormat = [
                {
                    size: '132 kB',
                    lastModified: '2021-09-06T20:01:23.576Z',
                    owner: 'luisao',
                    file: 'file.png'
                }
            ]
            expect(fs.promises.stat).toHaveBeenCalledWith(`/tmp/${filename}`);
            expect(result).toMatchObject(expectedFormat);
        })
    })
})