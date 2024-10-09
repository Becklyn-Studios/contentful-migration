import { Environment } from "contentful-management";
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
    const environment = await connectToContentfulManagementApi(clientConfig);
    const locale = await getDefaultLocale(environment);
    const executedMigrations = await getExecutedMigrations(environment, locale);
    const filteredMigrations = allMigrations.filter(
        migration => !executedMigrations.includes(migration.key)
    );

    await runMigrations(filteredMigrations, environment, locale, clientConfig);
};

const runMigrations = async (
    migrations: ContentfulContentModelMigration[],
    environment: Environment,
    locale: string,
    config: ContentfulManagementClientConfig
) => {
    console.log(`Running ${migrations.length} migrations`);

    for (const migration of migrations) {
        await runSingleMigration(migration, environment, locale, config);
    }

    console.log(`All migrations were successful`);
};

const runSingleMigration = async (
    migration: ContentfulContentModelMigration,
    environment: Environment,
    locale: string,
    config: ContentfulManagementClientConfig
) => {
    console.log(`Running migration "${migration.key}"`);

    await runMigration({
        migrationFunction: migration.migration,
        spaceId: config.spaceId,
        accessToken: config.managementToken,
        environmentId: config.environmentId,
        yes: true,
    });

    console.log(`Migration "${migration.key}" succeeded`);

    const newVersionEntry = await environment.createEntry(MIGRATIONS_MODEL_NAME, {
        fields: {
            version: {
                [locale]: migration.key,
            },
            executedAt: {
                [locale]: new Date().toString(),
            },
        },
    });

    await newVersionEntry.publish();

    console.log(`Saved ${migration.key} to ${MIGRATIONS_MODEL_NAME}`);
};
