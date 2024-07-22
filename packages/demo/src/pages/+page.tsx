import type { Loader, MetadataProps } from "@brinkjs/core";

import type { InferContext } from "elysia";
import { MainContext } from "@/context/MainContext";

export const context = MainContext;

export const metadata = async (c: InferContext<typeof context>): Promise<MetadataProps> => {
    return {
        title: `Brink ${c.store.version} - Demo`,
        description: "This is a demo page for Brink, using Alpine.js",
    };
};

export const loader = async (c: InferContext<typeof context>) => {
    return {
        message: `Brink${c.store.version} is running!`,
    };
};

export default function Page({ message }: Loader<typeof loader>) {
    return (
        <div class="p-4 flex" x-data="{ count: 0 }" hx-boost>
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
                    <button class="px-4 py-2 bg-indigo-500 text-white rounded-md" x-on:click="count--">
                        -
                    </button>
                    <div class="px-4 py-2 bg-slate-100 rounded-md">[[count]]</div>
                    <button class="px-4 py-2 bg-indigo-500 text-white rounded-md" x-on:click="count++">
                        +
                    </button>
                </div>
                <div class="flex gap-2 flex-wrap">
                    <template x-for="(_, x) in new Array(Math.abs(count))">
                        <div class="px-4 py-2 bg-slate-100 rounded-md">[[x + 1]]</div>
                    </template>
                </div>
                <template x-if="count > 5">
                    <div class="text-red-500">Uh oh this is getting a bit large</div>
                </template>
                <h1 class="font-bold text-3xl text-white bg-indigo-500 p-4 rounded-md vt-name-[banner]">{message}</h1>
            </div>
        </div>
    );
}
