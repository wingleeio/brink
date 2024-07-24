import type { Context } from "@brinkjs/core";
import { MainContext } from "$context/MainContext";

export const context = MainContext;

export function metadata() {
    return {
        title: "About Page",
    };
}

export function loader(c: Context<typeof context>) {
    return {
        version: c.store.version,
    };
}
