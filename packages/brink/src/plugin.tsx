import { Metadata, type MetadataProps } from "./Metadata";

import Elysia from "elysia";
import { join } from "path";
import type { Page, Route } from "./types";
import { isHTML } from "./utils";

export const brink = async (
    config: {
        metadata?: MetadataProps;
        transform?: (response: any) => any;
    } = {}
) => {
    const { directory, ...rest } = Object.assign(
        {
            directory: "src/pages",
            scripts: [],
            metadata: {
                title: "untitled",
                meta: [{}],
            },
        },
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
            }

            if (config.transform) {
                c.response = config.transform(c.response);
            }
        }
    );

    const pages = new Bun.Glob(`${directory}/**/+page.tsx`);
    const getRoutes = new Bun.Glob(`${directory}/**/+route.get.{ts,tsx}`);
    const postRoutes = new Bun.Glob(`${directory}/**/+route.post.{ts,tsx}`);
    const putRoutes = new Bun.Glob(`${directory}/**/+route.put.{ts,tsx}`);
    const patchRoutes = new Bun.Glob(`${directory}/**/+route.patch.{ts,tsx}`);
    const deleteRoutes = new Bun.Glob(`${directory}/**/+route.delete.{ts,tsx}`);

    const scriptMap = new Map<string, string>();

    const scripts = new Bun.Glob(`${directory}/**/+script.ts`);
    const globals = new Bun.Glob(`src/pages/+global.ts`);

    for (const path of globals.scanSync()) {
        scriptMap.set("global", path.replace("src/pages", "brink").replace(".ts", ".js"));
    }

    for (const path of scripts.scanSync()) {
        scriptMap.set(path.replace("+script.ts", "+page.tsx"), path.replace(directory, "brink").replace(".ts", ".js"));
    }

    for (const path of pages.scanSync()) {
        const url = path.replace(directory, "").replace("/+page.tsx", "") ?? "/";

        const module: Page = await import(
            join(process.cwd(), path.replace("tsx", "js").replace("src/pages", ".brink/"))
        );
        const Component = module.default;
        const context = module.context ?? new Elysia();

        plugin.use(context).get(url.length ? url : "/", async (c) => {
            let props = {};
            let metadata = Object.assign({}, rest.metadata);
            let script = scriptMap.get(path);
            let global = scriptMap.get("global");
            if (module.loader) props = await module.loader(c);
            if (module.metadata) metadata = Object.assign(metadata, await module.metadata(c));
            return (
                <html>
                    <head>
                        <meta charset="UTF-8" />
                        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                        {/* @ts-ignore */}
                        <Metadata {...metadata} />
                    </head>
                    <body>
                        {/* @ts-ignore */}
                        <Component {...props} />
                        {global ? <script src={"./" + global} /> : null}
                        {script ? <script src={"./" + script} /> : null}
                        {process.env.NODE_ENV === "development" ? <script src="./brink/hmr.js"></script> : null}
                    </body>
                </html>
            );
        });
    }

    for (const path of getRoutes.scanSync()) {
        const url =
            path
                .replace(directory, "")
                .replace("[...]", "*")
                .replace(/\[(.*?)\]/g, ":$1")
                .replace(/\/\+route\.get\.(ts|tsx)$/, "") ?? "/";
        const module: Route = await import(join(process.cwd(), path));
        const context = module.context ?? new Elysia();
        plugin.use(context).get(url, module.default);
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
        plugin.use(context).post(url, module.default);
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
        plugin.use(context).put(url, module.default);
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
        plugin.use(context).patch(url, module.default);
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
        plugin.use(context).delete(url, module.default);
    }

    for (const path of scripts.scanSync()) {
        plugin.get(
            "/" + path.replace("src/pages", "brink").replace(".ts", ".js"),
            () => new Response(Bun.file(path.replace(directory, ".brink").replace(".ts", ".js")))
        );
    }

    for (const path of globals.scanSync()) {
        plugin.get(
            "/" + path.replace("src/pages", "brink").replace(".ts", ".js"),
            () => new Response(Bun.file(path.replace("src/pages", ".brink").replace(".ts", ".js")))
        );
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
