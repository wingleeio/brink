interface MetaProps {
    name?: string;
    content?: string;
    property?: string;
}

interface LinkProps {
    rel?: string;
    href?: string;
}

interface ScriptProps {
    src: string;
    type?: string;
    defer?: boolean;
}

export interface MetadataProps {
    title?: string;
    description?: string;
    opengraph?: MetaProps[];
    scripts?: ScriptProps[];
    meta?: MetaProps[];
    links?: LinkProps[];
}

export function Metadata({
    title,
    description,
    opengraph = [],
    scripts = [],
    meta = [],
    links = [],
}: MetadataProps): JSX.Element {
    return (
        <>
            {title && <title>{title}</title>}
            {description && <meta name="description" content={description} />}
            {meta.map((metaProps, i) => (
                <meta key={i} {...metaProps} />
            ))}
            {opengraph.map((og, i) => (
                <meta key={i} property={og.property} content={og.content} />
            ))}
            {links.map((linkProps, i) => (
                <link key={i} {...linkProps} />
            ))}
            {scripts.map((scriptProps, i) => (
                <script key={i} {...scriptProps} />
            ))}
        </>
    );
}
