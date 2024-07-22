#!/usr/bin/env bun

import { join } from "path";
import { spawn } from "child_process";

spawn("bun", ["run", join(process.cwd(), "src/index.ts")], {
    stdio: "inherit",
    env: {
        PORT: "5100",
        ...process.env,
    },
});
