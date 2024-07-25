import type { BrinkConfig, Page, PageServer, Route } from "./types";
import { json, useLoaderData } from "react-router-dom";

import App from "./App";
import Elysia from "elysia";
import type { MetadataProps } from "./Metadata";
import {
    createStaticHandler,
    createStaticRouter,
    StaticRouterProvider,
    type StaticHandlerContext,
} from "react-router-dom/server";
import { isHTML } from "./utils";
import { join } from "path";
import { loadConfig } from "./config";
import { renderToPipeableStream } from "react-dom/server";
import stream from "stream";
import { Suspense } from "react";

export const brink = async (config: BrinkConfig = {}) => {
    const configFromFile = await loadConfig();
    const { directory, ...rest } = Object.assign(
        {
            directory: "src/pages",
            scripts: [],
            metadata: {
                title: "untitled",
                meta: [{}],
            },
        },
        configFromFile,
        config
    );
    const plugin = new Elysia({
        name: "brink",
        seed: directory,
    }).onAfterHandle(
        {
            as: "global",
        },
        (c) => {
            if (isHTML(c.response) && typeof c.response === "string") {
                c.set.headers["content-type"] = "text/html;charset=utf-8";
                c.response = "<!DOCTYPE html>" + c.response;
            }

            if (rest.transform) {
                c.response = rest.transform(c.response);
            }
        }
    );

    const pages = new Bun.Glob(`${directory}/**/+page.tsx`);
    const getRoutes = new Bun.Glob(`${directory}/**/+route.get.{ts,tsx}`);
    const postRoutes = new Bun.Glob(`${directory}/**/+route.post.{ts,tsx}`);
    const putRoutes = new Bun.Glob(`${directory}/**/+route.put.{ts,tsx}`);
    const patchRoutes = new Bun.Glob(`${directory}/**/+route.patch.{ts,tsx}`);
    const deleteRoutes = new Bun.Glob(`${directory}/**/+route.delete.{ts,tsx}`);

    const imported: {
        url: string;
        module: Page;
        moduleServer: PageServer | null;
        context: Elysia;
    }[] = [];

    for (const path of pages.scanSync()) {
        const url = path.replace(directory, "").replace("/+page.tsx", "") ?? "/";

        const module: Page = await import(
            join(process.cwd(), path.replace("tsx", "js").replace("src/pages", ".brink/"))
        );
        let moduleServer: PageServer | null = null;

        try {
            moduleServer = await import(
                join(process.cwd(), path.replace("tsx", "server.js").replace("src/pages", ".brink/"))
            );
        } catch (e) {}

        const context = moduleServer?.context ?? new Elysia();

        imported.push({ url, module, context, moduleServer });
    }

    for (const route of imported) {
        plugin.use(
            route.context.get(route.url.length ? route.url : "/", async (c) => {
                if (c.query.query === "loader") {
                    return (await route?.moduleServer?.loader?.(c)) ?? {};
                }
                if (c.query.query === "metadata") {
                    let metadata: MetadataProps = Object.assign({}, rest.metadata);
                    if (route.moduleServer?.metadata)
                        metadata = Object.assign(metadata, await route?.moduleServer?.metadata?.(c));
                    return metadata;
                }

                const dataRoutes: any = [];

                dataRoutes.push({
                    path: route.url.length ? route.url : "/",
                    async loader() {
                        let loader = {};
                        let metadata: MetadataProps = Object.assign({}, rest.metadata);
                        if (route.moduleServer?.loader) loader = await route.moduleServer.loader(c);

                        if (route.moduleServer?.metadata)
                            metadata = Object.assign(metadata, await route.moduleServer.metadata(c));
                        return json({ metadata, loader });
                    },
                    Component() {
                        const data: any = useLoaderData();
                        return (
                            <App metadata={data?.metadata}>
                                <route.module.default {...data?.loader} />
                            </App>
                        );
                    },
                });

                const handler = createStaticHandler(dataRoutes);
                const context = (await handler.query(c.request)) as StaticHandlerContext;
                const router = createStaticRouter(handler.dataRoutes, context);

                const rsc = await renderToPipeableStream(
                    <Suspense>
                        <StaticRouterProvider router={router} context={context} />
                    </Suspense>,
                    {
                        bootstrapModules: ["/brink/client.js", "/brink/hmr.js"],
                    }
                );

                const readable = new ReadableStream({
                    start: (controller) => {
                        rsc.pipe(
                            new stream.Writable({
                                write(chunk, _, callback) {
                                    controller.enqueue(chunk);
                                    callback();
                                },
                                destroy(error, callback) {
                                    if (error) {
                                        controller.error(error);
                                    } else {
                                        controller.close();
                                    }
                                    callback(error);
                                },
                            })
                        );
                    },
                });

                return new Response(readable, {
                    headers: { "Content-Type": "text/html" },
                });
            })
        );
    }

    plugin.get("/brink/client.js", () => new Response(Bun.file(".brink/client.js")));

    for (const path of getRoutes.scanSync()) {
        const url =
            path
                .replace(directory, "")
                .replace("[...]", "*")
                .replace(/\[(.*?)\]/g, ":$1")
                .replace(/\/\+route\.get\.(ts|tsx)$/, "") ?? "/";
        const module: Route = await import(join(process.cwd(), path));
        const context = module.context ?? new Elysia();
        plugin.use(context.get(url, module.default));
    }

    for (const path of postRoutes.scanSync()) {
        const url =
            path
                .replace(directory, "")
                .replace("[...]", "*")
                .replace(/\[(.*?)\]/g, ":$1")
                .replace(/\/\+route\.post\.(ts|tsx)$/, "") ?? "/";
        const module: Route = await import(join(process.cwd(), path));
        const context = module.context ?? new Elysia();
        plugin.use(context.post(url, module.default));
    }

    for (const path of putRoutes.scanSync()) {
        const url =
            path
                .replace(directory, "")
                .replace("[...]", "*")
                .replace(/\[(.*?)\]/g, ":$1")
                .replace(/\/\+route\.put\.(ts|tsx)$/, "") ?? "/";
        const module: Route = await import(join(process.cwd(), path));
        const context = module.context ?? new Elysia();
        plugin.use(context.put(url, module.default));
    }

    for (const path of patchRoutes.scanSync()) {
        const url =
            path
                .replace(directory, "")
                .replace("[...]", "*")
                .replace(/\[(.*?)\]/g, ":$1")
                .replace(/\/\+route\.patch\.(ts|tsx)$/, "") ?? "/";
        const module: Route = await import(join(process.cwd(), path));
        const context = module.context ?? new Elysia();
        plugin.use(context.patch(url, module.default));
    }

    for (const path of deleteRoutes.scanSync()) {
        const url =
            path
                .replace(directory, "")
                .replace("[...]", "*")
                .replace(/\[(.*?)\]/g, ":$1")
                .replace(/\/\+route\.delete\.(ts|tsx)$/, "") ?? "/";
        const module: Route = await import(join(process.cwd(), path));
        const context = module.context ?? new Elysia();
        plugin.use(context.delete(url, module.default));
    }

    const glob = new Bun.Glob(`public/**`);

    for (const path of glob.scanSync()) {
        plugin.get(path.replace("public", ""), () => new Response(Bun.file(path)));
    }

    if (process.env.NODE_ENV === "development") {
        plugin.get("/brink/hmr.js", () => new Response(Bun.file(".brink/hmr.js")));
        fetch("http://localhost:10000", { method: "GET" });
    }
    return plugin;
};
