import { Elysia } from "elysia";
import { brink } from "@brinkjs/core";
import swagger from "@elysiajs/swagger";
import { tailwind } from "@gtramontina.com/elysia-tailwind";

const app = new Elysia()
    .use(swagger())
    .use(
        tailwind({
            path: "/styles.css",
            source: "./src/index.css",
            config: "./tailwind.config.js",
        })
    )
    .use(brink())
    .listen(process.env.PORT ?? 3000);

console.log(`Brink is running at http://${app.server?.hostname}:${app.server?.port}`);
