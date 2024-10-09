import getMigration from "./migration";
import {
    BackendLanguage,
    ContentfulContentModelMigration,
    ContentfulContentModelMigrationGenerator,
} from "./types";

export const getMigrationsFromGenerators = async (
    language: BackendLanguage,
    generators?: ContentfulContentModelMigrationGenerator[]
): Promise<ContentfulContentModelMigration[]> => {
    if (!generators) {
        return [];
    }

    const migrations: ContentfulContentModelMigration[] = [];
    const migrationKeys: string[] = [];

    generators.forEach(getMigration => {
        const migrationFile = getMigration(language);

        Object.keys(migrationFile.migrations).forEach(key => {
            const migration = migrationFile.migrations[key];
            if (!migration) {
                return;
            }

            const migrationKey = `${migrationFile.component}-${key}`;

            if (migrationKeys.includes(migrationKey)) {
                throw new Error(`Migration with migrationKey ${migrationKey} already exists`);
            }

            migrationKeys.push(migrationKey);
            migrations.push({
                key: migrationKey,
                migration,
            });
        });
    });

    if (!migrationKeys.includes("migration-1")) {
        const migrationFile = getMigration(language);

        Object.keys(migrationFile.migrations).forEach(key => {
            const migration = migrationFile.migrations[key];
            if (!migration) {
                return;
            }

            const migrationKey = `${migrationFile.component}-${key}`;

            if (migrationKeys.includes(migrationKey)) {
                throw new Error(`Migration with migrationKey ${migrationKey} already exists`);
            }

            migrationKeys.push(migrationKey);
            migrations.unshift({
                key: migrationKey,
                migration,
            });
        });
    }

    return migrations;
};
