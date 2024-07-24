import { Metadata, type MetadataProps } from "./Metadata";

export default function App({ children, metadata }: { children: React.ReactNode; metadata?: MetadataProps }) {
    return (
        <html>
            <head>
                <Metadata {...metadata} />
            </head>
            <body>{children}</body>
        </html>
    );
}
