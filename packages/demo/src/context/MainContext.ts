import Elysia from "elysia";
import { GeneratorEmitter } from "$lib/GeneratorEmitter";

const events = new GeneratorEmitter();

export const MainContext = new Elysia().state("version", "0.0.1").state("count", 0).decorate({ events });
