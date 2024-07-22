#!/usr/bin/env bun

import { Command } from "commander";

const program = new Command();

program.name("brink-cli").description("CLI for building brink applications").version("0.0.1");

program
    .command("start")
    .description("start local server")
    .action(() => {
        import("./start");
    });

program
    .command("dev")
    .description("start the development server")
    .action(() => {
        import("./development");
    });

program
    .command("build")
    .description("start local server")
    .action(() => {
        import("./build");
    });

program.parse();
