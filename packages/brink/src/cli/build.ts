#!/usr/bin/env bun

import { bundlePageServer, bundlePagesClient } from "../bundler/page";
import { copyFile, exists, mkdir, readdir, rm } from "fs/promises";

import { externals } from "../_internal/externals";
import { join } from "path";

export const build = async () => {
    const directory = "src/pages";
    if (!(await exists(".brink"))) await mkdir(".brink");
    await rm(".brink", { recursive: true });

    if (process.env.NODE_ENV === "development") {
        await Bun.build({
            entrypoints: [join(__dirname, "../_internal/hmr.ts")],
            outdir: ".brink",
            sourcemap: "external",
        });
    }

    const variables = Object.keys(process.env);

    const envDotTs = variables.map((variable) => `export const ${variable} = process.env.${variable}!;`).join("\n");
    let envDotDTs = "declare module '$brink/env' {\n";
    envDotDTs += variables.map((variable) => `    export const ${variable}: string;`).join("\n");
    envDotDTs += "\n}";
    await Bun.write(join(".brink", "env.ts"), envDotTs);
    await Bun.write(join(".brink", "env.d.ts"), envDotDTs);
    const TSConfig = JSON.stringify(
        {
            compilerOptions: {
                rootDirs: [".."],
                paths: {
                    "$*": ["../src/*"],
                },
                verbatimModuleSyntax: true,
                isolatedModules: true,
                lib: ["esnext", "DOM", "DOM.Iterable"],
                moduleResolution: "bundler",
                module: "esnext",
                noEmit: true,
                target: "esnext",
            },
            include: ["env.d.ts", "../src/**/*.js", "../src/**/*.ts", "../src/**/*.jsx", "../src/**/*.tsx"],
            exclude: ["../node_modules/**"],
        },
        null,
        4
    );

    await Bun.write(join(".brink", "tsconfig.json"), TSConfig);

    const pageEntries: string[] = [];
    const clientEntries: string[] = [];

    const pages = new Bun.Glob(`${directory}/**/+page.tsx`);
    const pagesServer = new Bun.Glob(`${directory}/**/+page.server.ts`);
    const getRoutes = new Bun.Glob(`${directory}/**/+route.get.{ts,tsx}`);
    const postRoutes = new Bun.Glob(`${directory}/**/+route.post.{ts,tsx}`);
    const putRoutes = new Bun.Glob(`${directory}/**/+route.put.{ts,tsx}`);
    const patchRoutes = new Bun.Glob(`${directory}/**/+route.patch.{ts,tsx}`);
    const deleteRoutes = new Bun.Glob(`${directory}/**/+route.delete.{ts,tsx}`);

    for (const path of pages.scanSync()) {
        pageEntries.push(path);
        clientEntries.push(path);
    }

    for (const path of [
        ...getRoutes.scanSync(),
        ...postRoutes.scanSync(),
        ...putRoutes.scanSync(),
        ...patchRoutes.scanSync(),
        ...deleteRoutes.scanSync(),
        ...pagesServer.scanSync(),
    ]) {
        pageEntries.push(path);
    }

    if (pageEntries.length > 0) {
        await Bun.build({
            entrypoints: pageEntries,
            outdir: ".brink",
            sourcemap: "external",
            external: externals(),
            plugins: [
                {
                    name: "pages",
                    setup(build) {
                        build.onLoad({ filter: /\+page\.tsx?$/ }, async (args) => {
                            const source = await Bun.file(args.path).text();
                            const contents = bundlePageServer(source);
                            return { contents, loader: "tsx" };
                        });
                    },
                },
            ],
        });
    }

    const copyDir = async (src: string, dest: string, excludes: string[] = []) => {
        const entries = await readdir(src, { withFileTypes: true });

        if (!(await exists(dest))) {
            await mkdir(dest, { recursive: true });
        }

        for (let entry of entries) {
            const srcPath = join(src, entry.name);
            const destPath = join(dest, entry.name);

            if (entry.isDirectory()) {
                if (excludes.includes(entry.name)) continue;
                await copyDir(srcPath, destPath);
            } else if (entry.isFile()) {
                if (excludes.includes(entry.name)) continue;
                await copyFile(srcPath, destPath);
            }
        }
    };

    await copyDir(join(__dirname, ".."), ".brink/bundle", ["index.ts", "bundler", "cli"]);

    if (clientEntries.length > 0) {
        const clientPageEntries: string[] = [];
        for (const entry of clientEntries) {
            const source = await Bun.file(entry).text();
            const contents = bundlePageServer(source);
            await Bun.write(entry.replace("src", ".brink/bundle"), contents);
            clientPageEntries.push(entry.replace("src", ".brink/bundle"));
        }

        await Bun.build({
            entrypoints: [".brink/bundle/entry.client.tsx"],
            sourcemap: "external",
            splitting: true,
            format: "esm",
            target: "browser",
            outdir: ".brink",
            naming: "client.js",
            plugins: [
                {
                    name: "client",
                    setup(build) {
                        build.onLoad({ filter: /entry.client\.tsx?$/ }, async (args) => {
                            const source = await Bun.file(args.path).text();
                            const contents = bundlePagesClient(source, clientEntries);
                            return { contents, loader: "tsx" };
                        });
                    },
                },
            ],
        });
    }

    await rm(".brink/bundle", { recursive: true });
};

await build();
