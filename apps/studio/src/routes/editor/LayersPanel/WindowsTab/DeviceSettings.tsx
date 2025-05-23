import { useEditorEngine } from '@/components/Context';
import { Theme } from '@analogia/models/constants';
import type { FrameSettings } from '@analogia/models/projects';
import { Button } from '@analogia/ui/button';
import { Icons } from '@analogia/ui/icons/index';
import { useEffect, useState } from 'react';

const DeviceSettings = ({ settings }: { settings: FrameSettings }) => {
    const editorEngine = useEditorEngine();
    const [deviceTheme, setDeviceTheme] = useState(settings.theme);

    useEffect(() => {
        setDeviceTheme(settings.theme);
    }, [settings.id]);

    useEffect(() => {
        const observer = (newSettings: FrameSettings) => {
            if (newSettings.theme !== deviceTheme) {
                setDeviceTheme(newSettings.theme);
            }
        };

        editorEngine.canvas.observeSettings(settings.id, observer);

        return editorEngine.canvas.unobserveSettings(settings.id, observer);
    }, []);

    async function changeTheme(theme: Theme) {
        const webview = editorEngine.webviews.getWebview(settings.id);
        if (!webview) {
            return;
        }

        const themeValue =
            theme === Theme.System ? 'device' : theme === Theme.Dark ? 'dark' : 'light';

        webview.executeJavaScript(`window.api?.setTheme("${themeValue}")`).then((res) => {
            setDeviceTheme(theme);
        });

        editorEngine.canvas.saveFrame(settings.id, {
            theme: theme,
        });
    }

    return (
        <div className="flex flex-col gap-2">
            <p className="text-smallPlus text-foreground-primary">Device Settings</p>
            <div className="flex flex-row justify-between items-center">
                <span className="text-xs text-foreground-secondary">Theme</span>
                <div className="flex flex-row p-0.5 w-3/5 bg-background-secondary rounded">
                    <Button
                        size={'icon'}
                        className={`h-full w-full px-0.5 py-1.5 bg-background-secondary rounded-sm ${
                            deviceTheme === Theme.System
                                ? 'bg-background-tertiary hover:bg-background-tertiary'
                                : 'hover:bg-background-tertiary/50 text-foreground-analogia'
                        }`}
                        variant={'ghost'}
                        onClick={() => changeTheme(Theme.System)}
                    >
                        <Icons.Laptop />
                    </Button>
                    <Button
                        size={'icon'}
                        className={`h-full w-full px-0.5 py-1.5 bg-background-secondary rounded-sm ${
                            deviceTheme === Theme.Dark
                                ? 'bg-background-tertiary hover:bg-background-tertiary'
                                : 'hover:bg-background-tertiary/50 text-foreground-analogia'
                        }`}
                        variant={'ghost'}
                        onClick={() => changeTheme(Theme.Dark)}
                    >
                        <Icons.Moon />
                    </Button>
                    <Button
                        size={'icon'}
                        className={`h-full w-full px-0.5 py-1.5 bg-background-secondary rounded-sm ${
                            deviceTheme === Theme.Light
                                ? 'bg-background-tertiary hover:bg-background-tertiary'
                                : 'hover:bg-background-tertiary/50 text-foreground-analogia'
                        }`}
                        variant={'ghost'}
                        onClick={() => changeTheme(Theme.Light)}
                    >
                        <Icons.Sun />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DeviceSettings;
