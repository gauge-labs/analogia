import { useProjectsManager } from '@/components/Context';
import { invokeMainChannel } from '@/lib/utils';
import { DefaultSettings, MainChannels } from '@analogia/models/constants';
import { RunState } from '@analogia/models/run';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@analogia/ui/alert-dialog';
import { Button } from '@analogia/ui/button';
import { Icons } from '@analogia/ui/icons';
import { toast } from '@analogia/ui/use-toast';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';

export const ReinstallButton = observer(() => {
    const projectsManager = useProjectsManager();

    const project = projectsManager.project;
    const isTerminalRunning = projectsManager.runner?.state === RunState.RUNNING;
    const installCommand = project?.commands?.install || DefaultSettings.COMMANDS.install;

    const [isReinstalling, setIsReinstalling] = useState(false);
    const [showReinstallDialog, setShowReinstallDialog] = useState(false);

    const reinstallDependencies = async () => {
        if (!project?.folderPath) {
            toast({
                title: 'Error',
                description: 'Project path is not defined',
                variant: 'destructive',
            });
            return;
        }

        setIsReinstalling(true);

        try {
            await invokeMainChannel(MainChannels.REINSTALL_PROJECT_DEPENDENCIES, {
                folderPath: project.folderPath,
                installCommand: installCommand,
            });

            toast({
                title: 'Dependencies reinstalled',
                description: 'Project dependencies have been reinstalled successfully',
            });
        } catch (error) {
            toast({
                title: 'Failed to reinstall dependencies',
                description: error instanceof Error ? error.message : 'Unknown error occurred',
                variant: 'destructive',
            });
        } finally {
            setIsReinstalling(false);
            setShowReinstallDialog(false);
        }
    };

    const reinstall = () => {
        if (isTerminalRunning) {
            setShowReinstallDialog(true);
        } else {
            reinstallDependencies();
        }
    };

    const stopAndReinstall = async () => {
        setShowReinstallDialog(false);
        await projectsManager.runner?.stop();
        await reinstallDependencies();
        projectsManager.runner?.start();
    };

    return (
        <>
            <div className="pt-4 justify-end flex">
                <Button
                    variant="outline"
                    className="gap-2"
                    onClick={reinstall}
                    disabled={isReinstalling}
                >
                    {isReinstalling ? (
                        <Icons.Shadow className="h-4 w-4 animate-spin" />
                    ) : (
                        <Icons.Reload className="h-4 w-4" />
                    )}
                    {isReinstalling ? 'Reinstalling...' : 'Reinstall'}
                </Button>
            </div>
            <AlertDialog open={showReinstallDialog} onOpenChange={setShowReinstallDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reinstall Dependencies</AlertDialogTitle>
                        <AlertDialogDescription>
                            Your app is currently running. Reinstalling dependencies will stop the
                            running instance. Do you want to continue?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Button variant="ghost" onClick={() => setShowReinstallDialog(false)}>
                            Cancel
                        </Button>
                        <Button variant="outline" onClick={stopAndReinstall}>
                            Stop and Reinstall
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
});
