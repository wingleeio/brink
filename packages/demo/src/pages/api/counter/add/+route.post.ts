import type { Context } from "@brinkjs/core";
import { MainContext } from "@/context/MainContext";

export const context = MainContext;

export default async function route(c: Context<typeof context>) {
    c.store.count++;
    c.events.emit("counter");
}
