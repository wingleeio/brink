import type Elysia from "elysia";
import type { MetadataProps } from "./Metadata";

export interface Route {
    context?: Elysia;
    default: any;
}

export interface Page {
    default: (props: object) => React.ReactNode;
}

export interface PageServer {
    context?: Elysia;
    metadata?: (c: object) => Promise<object>;
    loader?: (c: object) => Promise<object>;
}

export type Loader<T extends (...args: any) => any> = Awaited<ReturnType<T>>;

export type BrinkConfig = {
    metadata?: MetadataProps;
    transform?: (response: any) => any;
    plugins?: Array<Elysia | Promise<Elysia>>;
};

export type Context<T extends { [key in string]: any }> = T["get" | "post" | "put" | "patch" | "delete"] extends (
    url: any,
    handler: infer H,
    ...rest: any
) => any
    ? H extends (context: infer C, ...rest: any) => any
        ? C
        : never
    : never;
