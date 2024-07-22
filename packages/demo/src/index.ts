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
                links: [
                    {
                        rel: "stylesheet",
                        href: "/styles.css",
                    },
                ],
            },
        })
    )
    .listen(process.env.PORT ?? 3000);

console.log(`Brink is running at ${app.server?.hostname}:${app.server?.port}`);
