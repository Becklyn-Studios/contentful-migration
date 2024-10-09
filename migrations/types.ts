import { MigrationFunction } from "contentful-migration";

export type BackendLanguage = "de" | "en";

export interface ContentfulContentModelMigrationSet {
    component: string;
    migrations: Record<string, MigrationFunction>;
}

export type ContentfulContentModelMigrationGenerator = (
    language: BackendLanguage
) => ContentfulContentModelMigrationSet;

export interface ContentfulContentModelMigration {
    key: string;
    migration: MigrationFunction;
}
