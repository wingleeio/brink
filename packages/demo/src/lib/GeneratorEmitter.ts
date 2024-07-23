import { EventEmitter } from "events";

export class GeneratorEmitter extends EventEmitter {
    async *listen(eventName: string): AsyncGenerator<any, void, unknown> {
        while (true) {
            yield new Promise((resolve) => {
                this.once(eventName, (data) => {
                    resolve(data);
                });
            });
        }
    }
}
