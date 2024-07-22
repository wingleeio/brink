import type Elysia from "elysia";
import type { MetadataProps } from "./Metadata";

export interface Route {
    context?: Elysia;
    default: any;
}

export interface Page {
    context?: Elysia;
    metadata?: (c: object) => Promise<object>;
    loader?: (c: object) => Promise<object>;
    default: (props: object) => JSX.Element;
}

export type Loader<T extends (...args: any) => any> = Awaited<ReturnType<T>>;

export type BrinkConfig = {
    metadata?: MetadataProps;
    transform?: (response: any) => any;
};
