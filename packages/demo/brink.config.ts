import type { BrinkConfig } from "@brinkjs/core";
import swagger from "@elysiajs/swagger";

export default {
    plugins: [swagger()],
    metadata: {
        links: [
            {
                rel: "stylesheet",
                href: "/styles.css",
            },
        ],
    },
} satisfies BrinkConfig;
