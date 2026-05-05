import { createClient } from "contentful-management";
import { runMigration } from "contentful-migration";
import {
    ContentfulManagementClientConfig,
    connectToContentfulManagementApi,
    getDefaultLocale,
    getExecutedMigrations,
} from "./api";
import { ContentfulContentModelMigration } from "./types";

export const MIGRATIONS_MODEL_NAME = "migrationVersions";

export const executeMigrations = async (
    clientConfig: ContentfulManagementClientConfig,
    allMigrations: ContentfulContentModelMigration[]
) => {
    await connectToContentfulManagementApi(clientConfig);
    const defaultLocale = await getDefaultLocale(clientConfig);
    const executedMigrations = await getExecutedMigrations(clientConfig, defaultLocale);
    const filteredMigrations = allMigrations.filter(
        migration => !executedMigrations.includes(migration.key)
    );

    await runMigrations(filteredMigrations, defaultLocale, clientConfig);
};

const runMigrations = async (
    migrations: ContentfulContentModelMigration[],
    locale: string,
    config: ContentfulManagementClientConfig
) => {
    console.log(`🔄 Running ${migrations.length} migrations`);

    for (const migration of migrations) {
        await runSingleMigration(migration, locale, config);
    }

    console.log(`✅ All migrations were successful`);
};

const runSingleMigration = async (
    migration: ContentfulContentModelMigration,
    locale: string,
    config: ContentfulManagementClientConfig
) => {
    console.log(`🚀 Running migration "${migration.key}"`);

    await runMigration({
        migrationFunction: migration.migration,
        spaceId: config.spaceId,
        accessToken: config.managementToken,
        environmentId: config.environmentId,
        yes: true,
    });

    console.log(`✅ Migration "${migration.key}" succeeded`);

    const client = createClient({ accessToken: config.managementToken });

    const newVersionEntry = await client.entry.create(
        {
            contentTypeId: MIGRATIONS_MODEL_NAME,
            environmentId: config.environmentId,
            spaceId: config.spaceId,
        },
        {
            fields: {
                version: { [locale]: migration.key },
                executedAt: { [locale]: new Date().toString() },
            },
        }
    );

    await client.entry.publish(
        {
            entryId: newVersionEntry.sys.id,
            environmentId: config.environmentId,
            spaceId: config.spaceId,
        },
        newVersionEntry
    );

    console.log(`💾 Saved ${migration.key} to ${MIGRATIONS_MODEL_NAME}`);
};
