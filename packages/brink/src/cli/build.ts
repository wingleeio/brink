#!/usr/bin/env bun

import { exists, mkdir, readdir, rm } from "fs/promises";

import { join } from "path";
import { readFileSync } from "fs";

export const build = async () => {
    const directory = "src/pages";
    if (!(await exists(".brink"))) await mkdir(".brink");
    const items = await readdir(".brink", { withFileTypes: true });
    const itemsToDelete = items.filter((item) => item.name !== "hmr.js" && item.name !== "hmr.js.map");
    const promises = itemsToDelete.map((item) => rm(join(".brink", item.name)));
    await Promise.all(promises);

    const globals = new Bun.Glob(`src/+global.ts`);

    const scripts = new Bun.Glob(`${directory}/**/+script.ts`);

    const scriptEntries: string[] = [];

    for (const path of scripts.scanSync()) {
        scriptEntries.push(path);
    }

    for (const path of globals.scanSync()) {
        scriptEntries.push(path);
    }

    if (scriptEntries.length !== 0) {
        await Bun.build({
            entrypoints: scriptEntries,
            outdir: ".brink",
            sourcemap: "external",
            minify: true,
        });
    }

    const pageEntries: string[] = [];

    const pages = new Bun.Glob(`${directory}/**/+page.tsx`);
    const getRoutes = new Bun.Glob(`${directory}/**/+route.get.{ts,tsx}`);
    const postRoutes = new Bun.Glob(`${directory}/**/+route.post.{ts,tsx}`);
    const putRoutes = new Bun.Glob(`${directory}/**/+route.put.{ts,tsx}`);
    const patchRoutes = new Bun.Glob(`${directory}/**/+route.patch.{ts,tsx}`);
    const deleteRoutes = new Bun.Glob(`${directory}/**/+route.delete.{ts,tsx}`);

    for (const path of [
        ...pages.scanSync(),
        ...getRoutes.scanSync(),
        ...postRoutes.scanSync(),
        ...putRoutes.scanSync(),
        ...patchRoutes.scanSync(),
        ...deleteRoutes.scanSync(),
    ]) {
        pageEntries.push(path);
    }

    await Bun.build({
        entrypoints: pageEntries,
        outdir: ".brink",
        sourcemap: "external",
        external: externals(),
        minify: true,
    });
};

function externals(): string[] {
    const packageJson = JSON.parse(readFileSync("./package.json").toString());

    const sections = ["dependencies", "devDependencies", "peerDependencies"],
        externals = new Set<string>();

    for (const section of sections) {
        if (packageJson[section]) Object.keys(packageJson[section]).forEach((_) => externals.add(_));
    }

    return Array.from(externals);
}

build();
