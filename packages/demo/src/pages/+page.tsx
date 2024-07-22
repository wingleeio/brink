import type { Loader } from "@brinkjs/core";

export const metadata = async () => {
    return {
        title: "Brink - Demo",
        description: "This is a demo page for Brink.",
    };
};

export const loader = async () => {
    return {
        message: "Brink is running!",
    };
};

export default function Page({ message }: Loader<typeof loader>) {
    return (
        <div class="p-4 flex flex-col gap-4">
            <h1 class="font-bold text-3xl transition-header">{message}</h1>
            <p>Welcome to the demo application!</p>
        </div>
    );
}
