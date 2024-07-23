import type { Context } from "@brinkjs/core";
import { MainContext } from "@/context/MainContext";
import { t } from "elysia";

export const context = MainContext.guard({
    response: t.Object({
        version: t.String(),
    }),
});

export default async function route(c: Context<typeof context>) {
    return {
        version: c.store.version,
    };
}
