import { Readable } from 'stream';

export default class TestUtil {

    static generateReadableStream(data) {
        return new Readable({
            objectMode: true,
            async read() {
                for(var item in data) {
                    this.push(item);
                };

                this.push(null);
            }
        })
    }
};