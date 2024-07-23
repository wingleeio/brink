import type { Context, Loader, MetadataProps } from "@brinkjs/core";

import { MainContext } from "@/context/MainContext";

export const context = MainContext;

export const metadata = async (c: Context<typeof context>): Promise<MetadataProps> => {
    return {
        title: `Brink ${c.store.version} - Demo`,
        description: "This is a demo page for Brink, using Alpine.js",
    };
};

export const loader = async (c: Context<typeof context>) => {
    return {
        message: `Brink ${c.store.version} is running!`,
        count: c.store.count,
        items: [
            { id: 1, name: "Item 1" },
            { id: 2, name: "Item 2" },
            { id: 3, name: "Item 3" },
            { id: 4, name: "Item 4" },
            { id: 5, name: "Item 5" },
        ],
    };
};

export default function Page({ message, items, count }: Loader<typeof loader>) {
    return (
        <div class="p-4 flex" hx-boost>
            <div class="flex flex-col gap-4 p-4 rounded-md border border-slate-200 overflow-hidden shadow-sm v-name-[card]">
                <div class="flex gap-4">
                    <a href="/" class="text-indigo-500 underline">
                        Home
                    </a>
                    <a href="/about" class="text-indigo-500 underline">
                        About
                    </a>
                </div>
                <p>Welcome to the demo application!</p>
                <div class="flex gap-2">
                    <button
                        hx-post="/api/counter/subtract"
                        hx-swap="none"
                        class="px-4 py-2 bg-indigo-500 text-white rounded-md"
                    >
                        -
                    </button>
                    <div
                        hx-ext="sse"
                        sse-connect="/api/counter"
                        sse-swap="counter"
                        class="px-4 py-2 bg-slate-100 rounded-md"
                    >
                        {count}
                    </div>
                    <button
                        hx-post="/api/counter/add"
                        hx-swap="none"
                        class="px-4 py-2 bg-indigo-500 text-white rounded-md"
                    >
                        +
                    </button>
                </div>
                <h1 class="font-bold text-3xl text-white bg-indigo-500 p-4 rounded-md vt-name-[banner]">{message}</h1>
                <div class="flex flex-col gap-4">
                    {items.map((item) => (
                        <div class="p-4 bg-slate-100 rounded-md">{item.name}</div>
                    ))}
                </div>
            </div>
        </div>
    );
}
