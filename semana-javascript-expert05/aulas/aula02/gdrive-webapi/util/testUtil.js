import { Readable } from 'stream';

export default class TestUtil {

    static generateReableStream(data) {
        return new Readable({
            async read() {
                for(var item in data) {
                    this.push(item);
                };

                this.push(null);
            }
        })
    }
};