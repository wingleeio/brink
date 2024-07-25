import * as parser from "@babel/parser";
import * as t from "@babel/types";

import generate from "@babel/generator";
import traverse from "@babel/traverse";

export const bundlePageServer = (code: string) => {
    const ast = parser.parse(code, { sourceType: "module", plugins: ["jsx", "typescript"] });

    traverse(ast, {
        ImportDeclaration(path) {
            const source = path.node.source;
            if (source.value === "./$props") {
                path.remove();
            }
        },
        Program(path) {
            const importDeclarations = path.node.body.filter((node) => t.isImportDeclaration(node));
            const nodes = path.node.body.filter((node) => !t.isImportDeclaration(node) || t.isJSXElement(node));

            const functionDeclaration = t.functionDeclaration(
                t.identifier("Page"),
                [t.identifier("props")],
                t.blockStatement([
                    ...nodes.map((node) => {
                        if ("expression" in node && t.isJSXElement(node.expression)) {
                            return t.returnStatement(t.parenthesizedExpression(node.expression));
                        }
                        return node;
                    }),
                ])
            );
            if (importDeclarations.length > 0) {
                t.addComment(importDeclarations[0], "leading", "@ts-nocheck", true);
            } else {
                t.addComment(nodes[0], "leading", "@ts-nocheck", true);
            }
            path.node.body = [...importDeclarations, t.exportDefaultDeclaration(functionDeclaration)];
        },
    });

    return generate(ast, {}, code).code;
};

export const bundlePagesClient = (code: string, pages: string[]) => {
    const ast = parser.parse(code, { sourceType: "module", plugins: ["jsx", "typescript"] });

    traverse(ast, {
        Program(path) {
            const importDeclarations = path.node.body.filter((node) => t.isImportDeclaration(node));
            let pageIdentifiers: t.Identifier[] = [];

            pages.forEach((page, i) => {
                const identifier = t.identifier(`Page${i}`);
                pageIdentifiers.push(identifier);
                const importDeclaration = t.importDeclaration(
                    [t.importDefaultSpecifier(identifier)],
                    t.stringLiteral("." + page.replace("src", ""))
                );
                importDeclarations.push(importDeclaration);
            });

            const nodes = path.node.body.filter((node) => !t.isImportDeclaration(node));

            path.node.body = [
                ...importDeclarations,
                ...nodes.map((node) => {
                    if (t.isVariableDeclaration(node) && t.isIdentifier(node.declarations[0].id, { name: "routes" })) {
                        const routes = t.arrayExpression(
                            pageIdentifiers.map((identifier, i) =>
                                t.objectExpression([
                                    t.objectProperty(
                                        t.identifier("url"),
                                        t.stringLiteral(pages[i].replace("src/pages", "").replace("/+page.tsx", ""))
                                    ),
                                    t.objectProperty(t.identifier("component"), identifier),
                                ])
                            )
                        );
                        const constDeclaration = t.variableDeclaration("const", [
                            t.variableDeclarator(node.declarations[0].id, routes),
                        ]);

                        return constDeclaration;
                    }
                    return node;
                }),
            ];
        },
    });

    return generate(ast, {}, code).code;
};

export const createPropTypes = (code: string) => {
    const ast = parser.parse(code, { sourceType: "module", plugins: ["typescript"] });

    traverse(ast, {
        Program(path) {
            const nodes = path.node.body;

            const loader = nodes.find(
                (node) =>
                    (t.isFunctionDeclaration(node) && t.isIdentifier(node.id, { name: "loader" })) ||
                    (t.isVariableDeclaration(node) &&
                        node.declarations.some(
                            (decl) =>
                                t.isIdentifier(decl.id, { name: "loader" }) &&
                                (t.isArrowFunctionExpression(decl.init) || t.isFunctionExpression(decl.init))
                        )) ||
                    (t.isExportNamedDeclaration(node) &&
                        ((t.isFunctionDeclaration(node.declaration) &&
                            t.isIdentifier(node.declaration.id, { name: "loader" })) ||
                            (t.isVariableDeclaration(node.declaration) &&
                                node.declaration.declarations.some(
                                    (decl) =>
                                        t.isIdentifier(decl.id, { name: "loader" }) &&
                                        (t.isArrowFunctionExpression(decl.init) || t.isFunctionExpression(decl.init))
                                ))))
            );

            path.node.body = [];

            if (loader) {
                path.node.body.push(
                    t.importDeclaration(
                        [t.importSpecifier(t.identifier("loader"), t.identifier("loader"))],
                        t.stringLiteral("./+page.server")
                    )
                );
                path.node.body.push(
                    t.exportNamedDeclaration(
                        t.variableDeclaration("const", [
                            t.variableDeclarator(
                                t.identifier("props"),
                                t.tsAsExpression(
                                    t.objectExpression([]),
                                    t.tsTypeReference(
                                        t.identifier("Awaited"),
                                        t.tsTypeParameterInstantiation([
                                            t.tsTypeReference(
                                                t.identifier("ReturnType"),
                                                t.tsTypeParameterInstantiation([t.tsTypeQuery(t.identifier("loader"))])
                                            ),
                                        ])
                                    )
                                )
                            ),
                        ])
                    )
                );
            }
        },
    });

    return generate(ast, {}, code).code;
};
