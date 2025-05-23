import { useProjectsManager } from '@/components/Context';
import { PublishStatus } from '@analogia/models/hosting';
import { DomainType } from '@analogia/models/projects';
import { Separator } from '@analogia/ui/separator';
import { observer } from 'mobx-react-lite';
import { AdvancedSettingsSection } from './AdvancedSettings';
import { DomainSection } from './Domain';

export const PublishDropdown = observer(() => {
    const projectsManager = useProjectsManager();
    if (!projectsManager.project) {
        return null;
    }

    const baseDomain = projectsManager.project?.domains?.base || null;
    const customDomain = projectsManager.project?.domains?.custom || null;

    const baseDomainState = projectsManager.domains?.base?.state || {
        status: PublishStatus.UNPUBLISHED,
        message: null,
    };
    const customDomainState = projectsManager.domains?.custom?.state || {
        status: PublishStatus.UNPUBLISHED,
        message: null,
    };

    return (
        <div className="rounded-md flex flex-col text-foreground-secondary">
            <DomainSection domain={baseDomain} type={DomainType.BASE} state={baseDomainState} />
            <Separator />
            <DomainSection
                domain={customDomain}
                type={DomainType.CUSTOM}
                state={customDomainState}
            />
            <Separator />
            <AdvancedSettingsSection />
        </div>
    );
});
