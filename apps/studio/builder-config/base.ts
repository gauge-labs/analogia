import { Configuration, TargetConfiguration } from 'electron-builder';

/**
 * @see https://www.electron.build/#documentation
 */
const config: Configuration = {
    appId: 'ai.analogia.studio',
    asar: true,
    directories: {
        output: 'release/${version}',
    },
    files: ['dist-electron', 'dist'],
    extraResources: [
        {
            from: 'resources/bun',
            to: 'bun',
            filter: ['**/*'],
        },
    ],
    mac: {
        artifactName: '${productName}-${arch}.${ext}',
        category: 'public.app-category.developer-tools',
        hardenedRuntime: true,
        gatekeeperAssess: false,
        target: [
            {
                target: 'dmg',
                arch: ['x64', 'arm64'],
            } as TargetConfiguration,
            {
                target: 'zip',
                arch: ['x64', 'arm64'],
            } as TargetConfiguration,
        ],
    },
    win: {
        target: [
            {
                target: 'nsis',
                arch: ['x64'],
            } as TargetConfiguration,
        ],
        artifactName: '${productName}-setup.${ext}',
        signtoolOptions: {
            publisherName: 'On Off, Inc',
        },
        azureSignOptions: {
            certificateProfileName: 'public-trust-analogia',
            codeSigningAccountName: 'trusted-analogia',
            endpoint: 'https://eus.codesigning.azure.net',
            timestampDigest: 'SHA256',
            timestampRfc3161: 'http://timestamp.acs.microsoft.com',
        },
    },
    linux: {
        target: [
            {
                target: 'AppImage',
                arch: ['x64', 'arm64'],
            } as TargetConfiguration,
            {
                target: 'deb',
                arch: ['x64', 'arm64'],
            } as TargetConfiguration,
        ],
        artifactName: '${productName}-${arch}.${ext}',
        category: 'Utility',
        desktop: {
            Name: 'Analogia',
        },
    },
    nsis: {},
    publish: {
        provider: 'github',
        owner: 'AnalogiaAI',
        repo: 'analogia',
    },
};

export default config;
