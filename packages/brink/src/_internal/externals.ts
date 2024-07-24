import { readFileSync } from "fs";

export function externals(): string[] {
    const packageJson = JSON.parse(readFileSync("./package.json").toString());

    const sections = ["dependencies", "devDependencies", "peerDependencies"],
        externals = new Set<string>();

    for (const section of sections) {
        if (packageJson[section]) Object.keys(packageJson[section]).forEach((_) => externals.add(_));
    }

    return Array.from(externals);
}
