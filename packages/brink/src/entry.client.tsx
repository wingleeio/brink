import { createBrowserRouter, json, RouterProvider, useLoaderData, type DataRouteObject } from "./_internal/router";

import App from "./_internal/App";
import { hydrateRoot } from "react-dom/client";

const routes: any = [];

const dataRouter: DataRouteObject[] = routes.map((route: any) => ({
    path: route.url.length ? route.url : "/",
    async loader() {
        const url = route.url.length ? route.url : "/";
        const loaderReq = await fetch(url + "?query=loader");
        const metadataReq = await fetch(url + "?query=metadata");
        const loader = await loaderReq.json();
        const metadata = await metadataReq.json();
        return json({
            loader: loader ?? {},
            metadata: metadata ?? {},
        });
    },
    Component() {
        const data: any = useLoaderData();
        return (
            <App metadata={data?.metadata}>
                <route.component {...data?.loader} />
            </App>
        );
    },
}));

let router = createBrowserRouter(dataRouter);

hydrateRoot(document, <RouterProvider router={router} fallbackElement={null} />);
