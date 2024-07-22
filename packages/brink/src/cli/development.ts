#!/usr/bin/env bun

import { join, resolve } from "path";

import Elysia from "elysia";
import { build } from "./build";
import { watch } from "fs";

const connections = new Set<any>();

function dispatch() {
    connections.forEach((connection) => {
        connection.send(true);
    });
}

await Bun.build({
    entrypoints: [join(__dirname, "../hmr.ts")],
    outdir: ".brink",
    sourcemap: "external",
});

new Elysia()
    .ws("/ws", {
        open(ws) {
            connections.add(ws);
        },
        close(ws) {
            connections.delete(ws);
        },
    })
    .get("/", () => {
        dispatch();
    })
    .onStart(() => {
        console.log(`Brink HMR is running`);
    })
    .listen(10000);

await build();

watch("src/", { recursive: true }, async (event, filename) => {
    if (event !== "change") return;
    if (resolve(filename as string).startsWith(".brink")) return;
    console.log(`\nChange detected - ${filename}`);
    console.log("Rebuilding...");
    await build();
});

await Bun.$`NODE_ENV=development PORT=${process.env.PORT || 5100} bun run --watch src/index.ts`;
