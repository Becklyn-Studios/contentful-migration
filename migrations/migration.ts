import {
    BackendLanguage,
    ContentfulContentModelMigrationGenerator,
    ContentfulContentModelMigrationSet,
} from "./types";

export const MIGRATIONS_MODEL_NAME = "migrationVersions";

const translations = {
    en: {
        migration: {
            name: "Migration",
            fields: {
                version: "Version",
                executedAt: "Executed at",
            },
        },
    },
    de: {
        migration: {
            name: "Migration",
            fields: {
                version: "Version",
                executedAt: "Ausgeführt am",
            },
        },
    },
};

const getMigration: ContentfulContentModelMigrationGenerator = (
    language: BackendLanguage
): ContentfulContentModelMigrationSet => {
    return {
        component: "migration",
        migrations: {
            1: migration => {
                const t = translations[language];

                const migrations = migration.createContentType(MIGRATIONS_MODEL_NAME, {
                    name: t.migration.name,
                });

                migrations.createField("version", {
                    type: "Symbol",
                    name: t.migration.fields.version,
                });
                migrations.createField("executedAt", {
                    type: "Symbol",
                    name: t.migration.fields.executedAt,
                });

                migrations.displayField("version");
            },
        },
    };
};

export default getMigration;
