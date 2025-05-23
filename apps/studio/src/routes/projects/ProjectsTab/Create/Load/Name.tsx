import { MainChannels } from '@analogia/models/constants';
import { Button } from '@analogia/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@analogia/ui/card';
import { Input } from '@analogia/ui/input';
import { Label } from '@analogia/ui/label';
import type { StepProps } from '..';
import { getRandomPlaceholder } from '../../../helpers';
import { invokeMainChannel } from '@/lib/utils';

export const LoadNameProject = ({
    props: { projectData, currentStep, setProjectData, totalSteps, prevStep, nextStep },
}: {
    props: StepProps;
}) => {
    function setProjectName(name: string) {
        setProjectData({
            ...projectData,
            name,
        });
    }

    function goBack() {
        prevStep();
    }

    return (
        <Card className="w-[30rem]">
            <CardHeader>
                <CardTitle>{'Let’s name your project'}</CardTitle>
                <CardDescription>
                    {
                        "This is your Analogia project name. Don't worry, This will not rename your actual folder."
                    }
                </CardDescription>
            </CardHeader>
            <CardContent className="h-24 flex items-center w-full">
                <div className="flex flex-col w-full gap-2">
                    <Label htmlFor="text">Project Name</Label>
                    <Input
                        type="text"
                        placeholder={getRandomPlaceholder()}
                        value={projectData.name || ''}
                        onInput={(e) => setProjectName(e.currentTarget.value)}
                    />
                </div>
            </CardContent>
            <CardFooter className="text-sm">
                <p className="text-foreground-analogia">{`${currentStep + 1} of ${totalSteps}`}</p>
                <div className="flex ml-auto gap-2">
                    <Button type="button" onClick={goBack} variant="ghost">
                        Back
                    </Button>
                    <Button
                        disabled={!projectData.name || projectData.name.length === 0}
                        type="button"
                        onClick={nextStep}
                        variant="outline"
                    >
                        Next
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
};
