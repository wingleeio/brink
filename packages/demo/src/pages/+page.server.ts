import type { Context } from "@brinkjs/core";
import { MainContext } from "$context/MainContext";

export const context = MainContext;

export function metadata() {
    return {
        title: "Home Page",
    };
}

export function loader(c: Context<typeof context>) {
    return {
        version: c.store.version,
    };
}
