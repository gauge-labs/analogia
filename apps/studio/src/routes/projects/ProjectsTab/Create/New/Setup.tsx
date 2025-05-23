import { invokeMainChannel, sendAnalytics } from '@/lib/utils';
import { CreateMethod } from '@/routes/projects/helpers';
import type { CreateStage } from '@analogia/models';
import { MainChannels } from '@analogia/models/constants';
import { Button } from '@analogia/ui/button';
import { CardDescription, CardTitle } from '@analogia/ui/card';
import { Icons } from '@analogia/ui/icons';
import { Progress } from '@analogia/ui/progress';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { useEffect, useState } from 'react';
import type { StepComponent } from '../withStepProps';

enum StepState {
    INSTALLING = 'installing',
    INSTALLED = 'installed',
    ERROR = 'error',
}

const NewSetupProject: StepComponent = ({ props, variant }) => {
    const { projectData, prevStep, nextStep } = props;
    const [state, setState] = useState<StepState>(StepState.INSTALLING);
    const [progress, setProgress] = useState<number>(0);
    const [message, setMessage] = useState<string>('Installing project');

    useEffect(() => {
        window.api.on(
            MainChannels.CREATE_NEW_PROJECT_CALLBACK,
            ({ stage, message }: { stage: CreateStage; message: string }) => {
                setMessage(message);
                if (stage === 'cloning') {
                    setProgress(30);
                } else if (stage === 'git_init') {
                    setProgress(50);
                } else if (stage === 'installing') {
                    setProgress(80);
                } else if (stage === 'complete') {
                    setProgress(100);
                    setState(StepState.INSTALLED);
                } else if (stage === 'error') {
                    setState(StepState.ERROR);
                    sendAnalytics('create project error', { message, method: CreateMethod.NEW });
                }
            },
        );

        return () => {
            window.api.removeAllListeners(MainChannels.CREATE_NEW_PROJECT_CALLBACK);
        };
    }, []);

    function handleClickPath() {
        invokeMainChannel(MainChannels.OPEN_IN_EXPLORER, projectData.folderPath);
    }

    const renderHeader = () => (
        <>
            <CardTitle>{renderTitle()}</CardTitle>
            <CardDescription>{renderDescription()}</CardDescription>
        </>
    );

    const renderContent = () => (
        <MotionConfig transition={{ duration: 0.5, type: 'spring', bounce: 0 }}>
            <AnimatePresence mode="popLayout">
                {state === StepState.INSTALLED && (
                    <motion.div
                        key="installed"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="w-full flex flex-row items-center border-[0.5px] p-4 rounded gap-2 text-green-950 bg-green-100/40 border-green-400 dark:border-green-500 dark:text-green-300 dark:bg-green-950"
                    >
                        <div className={'flex flex-col text-sm gap-1 break-all'}>
                            <p className="text-regularPlus">{projectData.name}</p>
                            <button
                                className="hover:underline text-mini text-start"
                                onClick={handleClickPath}
                            >
                                {projectData.folderPath}
                            </button>
                        </div>
                        <Icons.CheckCircled className="ml-auto" />
                    </motion.div>
                )}
                {state === StepState.ERROR && (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="text-sm w-full flex flex-row items-center border-[0.5px] p-4 rounded gap-2 border-red-500 text-red-900 bg-red-100/40 dark:border-red-600 dark:text-red-200 dark:bg-red-900"
                    >
                        <p>{message}</p>
                        <Icons.CrossCircled className="ml-auto w-12" />
                    </motion.div>
                )}
                {state === StepState.INSTALLING && (
                    <motion.div
                        key="installing"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex flex-col w-full gap-2 text-sm"
                    >
                        <Progress value={progress} className="w-full" />
                        <p>{message}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </MotionConfig>
    );

    const renderFooter = () => (
        <>
            <Button type="button" onClick={prevStep} variant="ghost">
                {state === StepState.INSTALLING ? 'Cancel' : 'Back'}
            </Button>
            <Button
                disabled={state === StepState.INSTALLING}
                variant={'outline'}
                onClick={nextStep}
            >
                {state === StepState.ERROR ? 'Continue anyway' : 'Complete setup'}
            </Button>
        </>
    );

    function renderTitle() {
        if (state === StepState.INSTALLED) {
            return 'Your project is ready';
        }
        if (state === StepState.ERROR) {
            return 'Error creating project';
        }
        return 'Setting up project...';
    }

    function renderDescription(): string | JSX.Element {
        if (state === StepState.INSTALLED) {
            return 'Open this project in Analogia any time to start designing';
        }
        if (state === StepState.ERROR) {
            return (
                <p>
                    {`Please try again or `}
                    <a href="mailto:support@analogia.ai" className="underline">
                        {'contact support'}
                    </a>
                    {` for help.`}
                </p>
            );
        }
        return 'Installing the right files and folders for you.';
    }

    switch (variant) {
        case 'header':
            return renderHeader();
        case 'content':
            return renderContent();
        case 'footer':
            return renderFooter();
    }
};

NewSetupProject.Header = (props) => <NewSetupProject props={props} variant="header" />;
NewSetupProject.Content = (props) => <NewSetupProject props={props} variant="content" />;
NewSetupProject.Footer = (props) => <NewSetupProject props={props} variant="footer" />;

NewSetupProject.Header.displayName = 'NewSetupProject.Header';
NewSetupProject.Content.displayName = 'NewSetupProject.Content';
NewSetupProject.Footer.displayName = 'NewSetupProject.Footer';

export { NewSetupProject };
