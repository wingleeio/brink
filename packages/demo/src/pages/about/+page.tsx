import type { InferContext } from "elysia";
import { MainContext } from "@/context/MainContext";
import type { MetadataProps } from "@brinkjs/core";

export const context = MainContext;

export const metadata = async (c: InferContext<typeof context>): Promise<MetadataProps> => {
    return {
        title: `Brink ${c.store.version} - About`,
        description: "This is a demo page for Brink, using Alpine.js",
    };
};

export default function Page() {
    return (
        <div class="p-4 flex" hx-boost>
            <div class="flex flex-col gap-4 p-4 rounded-md border border-slate-200 overflow-hidden shadow-sm v-name-[card]">
                <h1 class="font-bold text-3xl text-white bg-indigo-500 p-4 rounded-md vt-name-[banner]">About Brink</h1>

                <div class="flex gap-4">
                    <a href="/" class="text-indigo-500 underline">
                        Home
                    </a>
                    <a href="/about" class="text-indigo-500 underline">
                        About
                    </a>
                </div>
                <p>Brink allows you to use JSX to build powerful back end templates.</p>
            </div>
        </div>
    );
}
