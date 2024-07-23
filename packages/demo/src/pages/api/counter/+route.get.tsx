import type { Context } from "@brinkjs/core";
import { MainContext } from "@/context/MainContext";

export const context = MainContext;

export default async function* route(c: Context<typeof context>) {
    for await (const _ of c.events.listen("counter")) {
        yield `event: counter\ndata: ${c.store.count}\n\n`;
    }
}
