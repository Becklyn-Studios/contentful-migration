import { Environment, createClient } from "contentful-management";
import { MIGRATIONS_MODEL_NAME } from "./migration";

export interface ContentfulManagementClientConfig {
    spaceId: string;
    managementToken: string;
    environmentId: "master" | "staging" | "integration" | string;
}

export const connectToContentfulManagementApi = async (
    config: ContentfulManagementClientConfig
): Promise<Environment> => {
    const client = createClient({ accessToken: config.managementToken });
    const space = await client.getSpace(config.spaceId);
    return await space.getEnvironment(config.environmentId);
};

export const getDefaultLocale = async (environment: Environment): Promise<string> => {
    const { items: locales } = await environment.getLocales();

    const defaultLocale = locales.find(locale => locale.default);

    return defaultLocale ? defaultLocale.code : "en-US";
};

export const getExecutedMigrations = async (
    environment: Environment,
    locale: string
): Promise<string[]> => {
    let isInitialMigration = false;

    await environment.getContentType(MIGRATIONS_MODEL_NAME).catch(() => {
        isInitialMigration = true;
    });

    if (isInitialMigration) {
        return [];
    }

    let allVersions: any[] = [];
    let total: number | null = null;
    let skip = 0;

    while (total === null || total > allVersions.length) {
        const { items: versions, total: newTotal } = await environment.getEntries({
            content_type: MIGRATIONS_MODEL_NAME,
            limit: 1000,
            skip,
        });

        total = newTotal;
        skip += versions.length;
        allVersions = [...allVersions, ...versions];
    }

    return allVersions.map(version => version.fields.version[locale]).filter(version => !!version);
};
