import { DEFAULT_IDE } from '../ide/index.ts';

export const APP_NAME = 'Analogia';
export const APP_SCHEMA = 'analogia';
export const HOSTING_DOMAIN = 'analogia.live';
export const CUSTOM_OUTPUT_DIR = '.next-prod';
export const MAX_NAME_LENGTH = 50;

export enum EditorAttributes {
    // DOM attributes
    ANALOGIA_TOOLBAR = 'analogia-toolbar',
    ANALOGIA_RECT_ID = 'analogia-rect',
    ANALOGIA_STYLESHEET_ID = 'analogia-stylesheet',
    ANALOGIA_STUB_ID = 'analogia-drag-stub',
    ANALOGIA_MOVE_KEY_PREFIX = 'olk-',
    OVERLAY_CONTAINER_ID = 'overlay-container',
    CANVAS_CONTAINER_ID = 'canvas-container',

    // IDs
    DATA_ANALOGIA_ID = 'data-oid',
    DATA_ANALOGIA_INSTANCE_ID = 'data-oiid',
    DATA_ANALOGIA_DOM_ID = 'data-odid',
    DATA_ANALOGIA_COMPONENT_NAME = 'data-ocname',

    // Data attributes
    DATA_ANALOGIA_IGNORE = 'data-analogia-ignore',
    DATA_ANALOGIA_INSERTED = 'data-analogia-inserted',
    DATA_ANALOGIA_DRAG_SAVED_STYLE = 'data-analogia-drag-saved-style',
    DATA_ANALOGIA_DRAGGING = 'data-analogia-dragging',
    DATA_ANALOGIA_DRAG_DIRECTION = 'data-analogia-drag-direction',
    DATA_ANALOGIA_DRAG_START_POSITION = 'data-analogia-drag-start-position',
    DATA_ANALOGIA_NEW_INDEX = 'data-analogia-new-index',
    DATA_ANALOGIA_EDITING_TEXT = 'data-analogia-editing-text',
    DATA_ANALOGIA_DYNAMIC_TYPE = 'data-analogia-dynamic-type',
    DATA_ANALOGIA_CORE_ELEMENT_TYPE = 'data-analogia-core-element-type',
    ANALOGIA_DEFAULT_STYLESHEET_ID = 'analogia-default-stylesheet',
}

export enum Links {
    DISCORD = 'https://discord.gg/HYzeUDXJvZ',
    GITHUB = 'https://github.com/AnalogiaAI/analogia',
    USAGE_DOCS = 'https://github.com/AnalogiaAI/analogia/wiki/How-to-set-up-my-project%3F',
    WIKI = 'https://github.com/AnalogiaAI/analogia/wiki',
    OPEN_ISSUE = 'https://github.com/AnalogiaAI/analogia/issues/new/choose',
}

export enum Orientation {
    Potrait = 'Potrait',
    Landscape = 'Landscape',
}

export enum Theme {
    Light = 'light',
    Dark = 'dark',
    System = 'system',
}

export const DefaultSettings = {
    SCALE: 0.7,
    PAN_POSITION: { x: 175, y: 100 },
    URL: 'http://localhost:3000/',
    FRAME_POSITION: { x: 0, y: 0 },
    FRAME_DIMENSION: { width: 1536, height: 960 },
    ASPECT_RATIO_LOCKED: false,
    DEVICE: 'Custom:Custom',
    THEME: Theme.System,
    ORIENTATION: Orientation.Potrait,
    MIN_DIMENSIONS: { width: '280px', height: '360px' },
    COMMANDS: {
        run: 'npm run dev',
        build: 'npm run build',
        install: 'npm install',
    },
    IMAGE_FOLDER: 'public/images',
    IMAGE_DIMENSION: { width: '100px', height: '100px' },
    CHAT_SETTINGS: {
        showSuggestions: true,
        autoApplyCode: true,
        expandCodeBlocks: false,
        showMiniChat: true,
    },
    EDITOR_SETTINGS: {
        shouldWarnDelete: true,
        ideType: DEFAULT_IDE,
        enableBunReplace: true,
        buildFlags: '--no-lint',
    },
};
