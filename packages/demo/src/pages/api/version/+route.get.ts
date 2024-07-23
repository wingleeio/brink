import Elysia, { t } from "elysia";

import type { Context } from "@brinkjs/core";
import { MainContext } from "@/context/MainContext";

export const context = new Elysia().use(MainContext).guard({
    response: t.Object({
        version: t.String(),
    }),
});

export default async function route(c: Context<typeof context>) {
    return {
        version: c.store.version,
    };
}
