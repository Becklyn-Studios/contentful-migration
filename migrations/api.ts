import { createClient } from "contentful-management";
import { MIGRATIONS_MODEL_NAME } from "./migration";

export interface ContentfulManagementClientConfig {
    spaceId: string;
    managementToken: string;
    environmentId: "master" | "staging" | "integration" | string;
}

export const connectToContentfulManagementApi = async (
    config: ContentfulManagementClientConfig
): Promise<void> => {
    const client = createClient({ accessToken: config.managementToken });
    const space = await client.space.get({ spaceId: config.spaceId });
    if (!space) {
        throw new Error(`Space ${config.spaceId} not found`);
    }
    const environment = await client.environment.get({
        spaceId: config.spaceId,
        environmentId: config.environmentId,
    });
    if (!environment) {
        throw new Error(`Environment ${config.environmentId} not found`);
    }
};

export const getDefaultLocale = async (
    config: ContentfulManagementClientConfig
): Promise<string> => {
    const client = createClient({ accessToken: config.managementToken });
    const locales = await client.locale.getMany({
        spaceId: config.spaceId,
        environmentId: config.environmentId,
    });

    let defaultLocale: string | undefined;

    for (const locale of locales.items) {
        if (locale.default) {
            defaultLocale = locale.code;
            break;
        }
    }
    return defaultLocale ? defaultLocale : "en-US";
};

export const getExecutedMigrations = async (
    config: ContentfulManagementClientConfig,
    locale: string
): Promise<string[]> => {
    const client = createClient({ accessToken: config.managementToken });

    let isInitialMigration = false;

    await client.contentType
        .get({
            contentTypeId: MIGRATIONS_MODEL_NAME,
            spaceId: config.spaceId,
            environmentId: config.environmentId,
        })
        .catch(() => {
            isInitialMigration = true;
        });

    if (isInitialMigration) {
        return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let allVersions: any[] = [];
    let total: number | null = null;
    let skip = 0;

    while (total === null || total > allVersions.length) {
        const { items: versions, total: newTotal } = await client.entry.getMany({
            environmentId: config.environmentId,
            spaceId: config.spaceId,
            query: { content_type: MIGRATIONS_MODEL_NAME, limit: 1000, skip },
        });

        total = newTotal;
        skip += versions.length;
        allVersions = [...allVersions, ...versions];
    }

    return allVersions.map(version => version.fields.version[locale]).filter(version => !!version);
};
