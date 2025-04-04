import {
    useAuthManager,
    useEditorEngine,
    useProjectsManager,
    useUserManager,
} from '@/components/Context';
import UserProfileDropdown from '@/components/ui/UserProfileDropdown';
import { SettingsTabValue } from '@/lib/models';
import { ProjectTabs } from '@/lib/projects';
import { UsagePlanType } from '@analogia/models/usage';
import { Button } from '@analogia/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@analogia/ui/dropdown-menu';
import { Icons } from '@analogia/ui/icons';
import { cn } from '@analogia/ui/utils';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/components/ThemeProvider';

export const TopBar = observer(() => {
    const editorEngine = useEditorEngine();
    const projectsManager = useProjectsManager();
    const authManager = useAuthManager();
    const userManager = useUserManager();
    const plan = userManager.subscription?.plan;
    const { t } = useTranslation();
    const { theme } = useTheme();

    function signOut() {
        authManager.signOut();
    }

    function openPromptCreation() {
        projectsManager.projectsTab = ProjectTabs.PROMPT_CREATE;
    }

    function openImportProject() {
        projectsManager.projectsTab = ProjectTabs.IMPORT_PROJECT;
    }

    return (
        <div className="flex flex-row h-12 px-12 items-center">
            <div className="flex-1 flex items-center justify-start mt-3">
                <Icons.AnalogiaTextLogo
                    className="w-24"
                    theme={theme === 'system' ? 'dark' : theme}
                    viewBox="0 0 139 17"
                />
            </div>
            <div className="flex-1 flex justify-end space-x-2 mt-4 items-center">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            className="text-sm text-foreground-analogia focus:outline-none"
                            variant="ghost"
                        >
                            <Icons.Plus className="w-5 h-5 mr-2" />
                            {t('projects.actions.newProject')}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem
                            className={cn(
                                'focus:bg-blue-100 focus:text-blue-900',
                                'hover:bg-blue-100 hover:text-blue-900',
                                'dark:focus:bg-blue-900 dark:focus:text-blue-100',
                                'dark:hover:bg-blue-900 dark:hover:text-blue-100',
                            )}
                            onSelect={openPromptCreation}
                        >
                            <Icons.FilePlus className="w-4 h-4 mr-2" />
                            {t('projects.actions.startFromScratch')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className={cn(
                                'focus:bg-teal-100 focus:text-teal-900',
                                'hover:bg-teal-100 hover:text-teal-900',
                                'dark:focus:bg-teal-900 dark:focus:text-teal-100',
                                'dark:hover:bg-teal-900 dark:hover:text-teal-100',
                            )}
                            onSelect={openImportProject}
                        >
                            <Icons.Download className="w-4 h-4 mr-2" />
                            {t('projects.actions.importProject')}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <UserProfileDropdown>
                    {plan === UsagePlanType.PRO && (
                        <DropdownMenuItem
                            onSelect={() => {
                                editorEngine.isPlansOpen = true;
                            }}
                        >
                            <Icons.Person className="w-4 h-4 mr-2" />
                            Subscription
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                        onSelect={() => {
                            editorEngine.isSettingsOpen = true;
                            editorEngine.settingsTab = SettingsTabValue.PREFERENCES;
                        }}
                    >
                        <Icons.Gear className="w-4 h-4 mr-2" />
                        {t('projects.actions.settings')}
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled={!authManager.isAuthEnabled} onSelect={signOut}>
                        <Icons.Exit className="w-4 h-4 mr-2" />
                        {t('projects.actions.signOut')}
                    </DropdownMenuItem>
                </UserProfileDropdown>
            </div>
        </div>
    );
});
