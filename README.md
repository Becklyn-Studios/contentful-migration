# Contentful Migrations

The Contentful Migrations library is a tool that helps you manage the content model of your Contentful space.

It provides a way to create and execute migrations for your content model by defining migrations as code.

It is based on the `contentful-migration` package and uses the Contentful Management API to create and execute migrations.

It automatically tracks which migrations have been executed and which ones need to be executed.

## Usage

Install this library into your project:

```shell
npm i --save @becklyn/contentful-migrations
```

## Config

Add a `.env` or `.env.local` file to your project and set the following variables:

```env
CONTENTFUL_SPACE_ID=
CONTENTFUL_ENVIRONMENT_ID=
CONTENTFUL_MANAGEMENT_ACCESS_TOKEN=
```

## Migrations

Create a `migrations` folder in your project and add your migrations files there.

```ts
import type { ContentfulContentModelMigrationGenerator } from "@becklyn/contentful-migration/dist/migrations/types";
import { getPageMigration } from "./page";

const migrations: ContentfulContentModelMigrationGenerator[] = (() => {
    return [getPageMigration];
})();

export default migrations;
```

Create a migration file for the page content type (e.g. `page.ts`):

```ts
export const getPageMigration: ContentfulContentModelMigrationGenerator =
    (): ContentfulContentModelMigrationSet => {
        return {
            component: "page",
            migrations: {
                1: migration => {
                    const page = migration.createContentType("page", {
                        name: "📄 Page",
                    });

                    page.createField("name", {
                        type: "Symbol",
                        name: "Internal Name",
                        required: true,
                    });

                    page.createField("slug", {
                        type: "Symbol",
                        name: "Slug",
                        localized: true,
                        required: false,
                        validations: [
                            { regexp: { pattern: "^\\/([a-z0-9\\-\\/])*$" } },
                            { unique: true },
                        ],
                    });

                    page.changeFieldControl("slug", "builtin", "slugEditor", {
                        helpText: "The last part of the URL for this page.",
                        trackingFieldId: "name",
                    });

                    page.displayField("name");
                },
            },
        };
    };
```

Add the `migrate` script to your `package.json` file:

```json
"scripts": {
     "migrate": "npx @becklyn/contentful-migration"
}
```

Run the migrations:

```shell
npm run migrate
```


## How it works

This library uses the `contentful-migration` package to create and execute migrations.
For versioning it creates a `migrationVersions` content type that tracks which migrations have been executed.
Migrations are identified by their component name and the migration number.
Migrations are executed in the order of their migration number.
