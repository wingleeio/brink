import { Elysia } from "elysia";
import { brink } from "@brinkjs/core";
import { tailwind } from "@gtramontina.com/elysia-tailwind";

const app = new Elysia()
    .use(
        tailwind({
            path: "/styles.css",
            source: "./src/index.css",
            config: "./tailwind.config.js",
        })
    )
    .use(
        brink({
            metadata: {
                scripts: ["https://unpkg.com/htmx.org@2.0.1"],
                links: [
                    {
                        rel: "stylesheet",
                        href: "/styles.css",
                    },
                ],
            },
            transform(value) {
                if (typeof value === "string") {
                    const delimiters = /\[\[(.*?)\]\]/g;
                    return value.replace(delimiters, (_, key) => `<span x-text='${key}'></span>`);
                }

                return value;
            },
        })
    )
    .listen(process.env.PORT ?? 3000);

console.log(`Brink is running at http://${app.server?.hostname}:${app.server?.port}`);
