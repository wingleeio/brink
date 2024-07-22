import type { BrinkConfig } from "@brinkjs/core";

export default {
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
} satisfies BrinkConfig;
