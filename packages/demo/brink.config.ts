import type { BrinkConfig } from "@brinkjs/core";

export default {
    metadata: {
        scripts: [
            {
                src: "https://unpkg.com/htmx.org@2.0.1",
            },
            {
                src: "https://unpkg.com/htmx-ext-sse@2.2.0/sse.js",
            },
        ],
        links: [
            {
                rel: "stylesheet",
                href: "/styles.css",
            },
        ],
    },
    transform(_value) {
        if (typeof _value === "string") {
            let value = _value;
            value = value.replace(/\[\[(.*?)\]\]/g, (_, expression) => `<span x-text='${expression}'></span>`);
            value = value.replace(/@each\("(.*?)"\)/g, (_, expression) => `<template x-for='${expression}'>`);
            value = value.replace(/@if\("(.*?)"\)/g, (_, expression) => `<template x-if='${expression}'>`);
            value = value.replace(/@end/g, `</template>`);
            return value;
        }

        return _value;
    },
} satisfies BrinkConfig;
