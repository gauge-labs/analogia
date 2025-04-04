// import {
//     useAuthManager,
//     useEditorEngine,
//     useProjectsManager,
//     useUserManager,
// } from '@/components/Context';
// import UserProfileDropdown from '@/components/ui/UserProfileDropdown';
// import { SettingsTabValue } from '@/lib/models';
// import { ProjectTabs } from '@/lib/projects';
import { Button } from "@analogia/ui-v4/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@analogia/ui-v4/dropdown-menu";
import { Icons } from "@analogia/ui-v4/icons";
import { cn } from "@analogia/ui-v4/utils";

export const TopBar = () => {
  // const editorEngine = useEditorEngine();
  // const projectsManager = useProjectsManager();
  // const authManager = useAuthManager();
  // const userManager = useUserManager();
  // const plan = userManager.subscription?.plan;

  // function signOut() {
  //     authManager.signOut();
  // }

  // function openPromptCreation() {
  //     projectsManager.projectsTab = ProjectTabs.PROMPT_CREATE;
  // }

  // function openImportProject() {
  //     projectsManager.projectsTab = ProjectTabs.IMPORT_PROJECT;
  // }

  return (
    <div className="flex h-12 flex-row items-center px-12">
      <div className="mt-3 flex flex-1 items-center justify-start">
        <Icons.AnalogiaTextLogo className="w-24" viewBox="0 0 139 17" />
      </div>
      <div className="mt-4 flex flex-1 items-center justify-end space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="text-foreground-analogia text-sm focus:outline-none"
              variant="ghost"
            >
              <Icons.Plus className="mr-2 h-5 w-5" />
              New Project
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              className={cn(
                "focus:bg-blue-100 focus:text-blue-900",
                "hover:bg-blue-100 hover:text-blue-900",
                "dark:focus:bg-blue-900 dark:focus:text-blue-100",
                "dark:hover:bg-blue-900 dark:hover:text-blue-100",
              )}
              // onSelect={openPromptCreation}
            >
              <Icons.FilePlus className="mr-2 h-4 w-4" />
              Start from scratch
            </DropdownMenuItem>
            <DropdownMenuItem
              className={cn(
                "focus:bg-teal-100 focus:text-teal-900",
                "hover:bg-teal-100 hover:text-teal-900",
                "dark:focus:bg-teal-900 dark:focus:text-teal-100",
                "dark:hover:bg-teal-900 dark:hover:text-teal-100",
              )}
              // onSelect={openImportProject}
            >
              <Icons.Download className="mr-2 h-4 w-4" />
              Import existing project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* <UserProfileDropdown>
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
                        Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled={!authManager.isAuthEnabled} onSelect={signOut}>
                        <Icons.Exit className="w-4 h-4 mr-2" />
                        Sign out
                    </DropdownMenuItem>
                </UserProfileDropdown> */}
      </div>
    </div>
  );
};
