/** @type {import("eslint").Linter.Config} */
module.exports = {
    extends: ["next", "plugin:@dword-design/import-alias/recommended"],
    ignorePatterns: ["node_modules/", "dist/"],
    rules: {
        "@dword-design/import-alias/prefer-alias": [
            "error",
            {
                alias: {
                    "@/migrations": "./migrations",
                },
            },
        ],
    },
};
