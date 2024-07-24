import { join } from "path";

export async function loadConfig() {
    try {
        const configFromFile = await import(join(process.cwd(), "brink.config.ts"));
        return configFromFile.default;
    } catch (error) {
        return {};
    }
}
