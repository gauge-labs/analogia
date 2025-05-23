import { CreateStage, type CreateCallback } from '@analogia/models';
import download from 'download';
import * as fs from 'fs';
import * as path from 'path';
import { runBunCommand } from '../bun';

export async function createProject(
    projectName: string,
    targetPath: string,
    onProgress: CreateCallback,
): Promise<void> {
    try {
        const fullPath = path.join(targetPath, projectName);

        // Check if the directory already exists
        if (fs.existsSync(fullPath)) {
            throw new Error(
                `Directory ${fullPath} already exists. Please import it to Analogia or go back to create a different folder.`,
            );
        }

        onProgress(CreateStage.CLONING, `Generating now....`);
        await downloadTemplate(fullPath);

        // Install dependencies
        const result = await runBunCommand('npm install -y --no-audit --no-fund', {
            cwd: fullPath,
        });

        if (!result.success) {
            throw new Error(`Failed to install dependencies: ${result.error}`);
        }

        onProgress(CreateStage.COMPLETE, 'Project created successfully!');
    } catch (error) {
        onProgress(CreateStage.ERROR, `Project creation failed: ${error}`);
        throw error;
    }
}

async function downloadTemplate(fullPath: string) {
    try {
        const zipUrl = `https://github.com/AnalogiaAI/starter/archive/refs/heads/master.zip`;
        await download(zipUrl, fullPath, {
            extract: true,
            strip: 1,
            retry: 3,
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw new Error(`Failed to download and extract template: ${error.message}`);
        }
        throw new Error('Failed to download and extract template: Unknown error');
    }
}
