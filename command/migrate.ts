import { config } from "dotenv";
import { register } from "ts-node";
import { register as registerPaths } from "tsconfig-paths";
import { getMigrationsFromGenerators } from "@/migrations/generator";
import { executeMigrations } from "@/migrations/migrator";
import { BackendLanguage, ContentfulContentModelMigrationGenerator } from "@/migrations/types";

export const executeMigrationCommand = async () => {
    console.log("Checking environment...");

    config({ override: false });

    if (process.env.CONTENTFUL_SKIP_MIGRATIONS === "true") {
        console.log("CONTENTFUL_SKIP_MIGRATIONS flag set, skipping migrations and exiting early");
        process.exit(0);
    }

    console.log("Executing migrations...");

    register({
        transpileOnly: true,
        compilerOptions: {
            baseUrl: ".",
            target: "es2017",
            module: "commonjs",
            strict: true,
            skipLibCheck: true,
            esModuleInterop: true,
            moduleResolution: "node",
            lib: ["es2017"],
        },
    });

    registerPaths({
        baseUrl: ".",
        paths: {
            "@/migrations/*": ["./migrations/*"],
        },
    });

    let migrationsFile = process.env.CONTENTFUL_MIGRATIONS_FILE ?? "./migrations/index.ts";

    console.log(`Loading migrations from file ${migrationsFile}`);

    if (migrationsFile.startsWith("./")) {
        migrationsFile = process.cwd() + migrationsFile.slice(1);
    }

    let migrationGenerators: ContentfulContentModelMigrationGenerator[] = [];

    try {
        const { default: module } = await import(migrationsFile);

        if (!module || !Array.isArray(module) || module.length === 0) {
            throw new Error(`No migrations found in file ${migrationsFile}`);
        }

        if (typeof module[0] !== "function") {
            throw new Error(`Invalid migrations file ${migrationsFile}`);
        }

        migrationGenerators = module;
    } catch (error) {
        console.log(error);
        throw new Error(`Failed to load migrations from file ${migrationsFile}`);
    }

    const backendLanguage = process.env.CONTENTFUL_BACKEND_LANGUAGE ?? "en";

    const migrations = await getMigrationsFromGenerators(
        backendLanguage as BackendLanguage,
        migrationGenerators
    );

    await executeMigrations(
        {
            spaceId: process.env.CONTENTFUL_SPACE_ID ?? "",
            environmentId: process.env.CONTENTFUL_ENVIRONMENT_ID ?? "",
            managementToken: process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN ?? "",
        },
        migrations
    );

    process.exit(0);
};
