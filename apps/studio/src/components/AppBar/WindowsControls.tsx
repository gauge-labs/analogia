import { invokeMainChannel } from '@/lib/utils';
import { MainChannels } from '@analogia/models/constants';
import { WindowCommand } from '@analogia/models/projects';
import { Button } from '@analogia/ui/button';
import { Icons } from '@analogia/ui/icons';
import { useState } from 'react';

export const WindowsControls = () => {
    const [isMaximized, setIsMaximized] = useState(true);

    if (process.platform !== 'win32' && process.platform !== 'linux') {
        return null;
    }

    function sendCommand(command: WindowCommand) {
        invokeMainChannel(MainChannels.SEND_WINDOW_COMMAND, command);
        if (command === WindowCommand.MAXIMIZE || command === WindowCommand.UNMAXIMIZE) {
            setIsMaximized(!isMaximized);
        }
    }

    return (
        <div className="flex text-foreground-active h-full">
            <Button
                onClick={() => sendCommand(WindowCommand.MINIMIZE)}
                variant={'ghost'}
                className="hover:bg-background-analogia/30  hover:text-foreground outline-border w-full h-full rounded-none"
                aria-label="Minimize"
            >
                <Icons.Minus className="h-3 w-3" />
            </Button>
            <Button
                onClick={() =>
                    sendCommand(isMaximized ? WindowCommand.UNMAXIMIZE : WindowCommand.MAXIMIZE)
                }
                variant={'ghost'}
                className="hover:bg-background-analogia/30 hover:text-foreground outline-border w-full h-full rounded-none"
                aria-label="Maximize"
            >
                <Icons.Copy className="h-3 w-3 scale-x-[-1]" />
            </Button>
            <Button
                onClick={() => sendCommand(WindowCommand.CLOSE)}
                variant={'ghost'}
                className="hover:bg-[#e81123] active:bg-[#e81123]/50 hover:text-foreground outline-border w-full h-full rounded-none"
                aria-label="Close"
            >
                <Icons.CrossL className="h-3 w-3" />
            </Button>
        </div>
    );
};
