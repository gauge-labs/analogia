// import { useProjectsManager } from '@/components/Context';
import type { Project } from "@analogia/models/projects";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@analogia/ui-v4/alert-dialog";
import { Button } from "@analogia/ui-v4/button";
import { Checkbox } from "@analogia/ui-v4/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@analogia/ui-v4/dropdown-menu";
import { Icons } from "@analogia/ui-v4/icons";
import { Input } from "@analogia/ui-v4/input";
import { Label } from "@analogia/ui-v4/label";
import { cn } from "@analogia/ui-v4/utils";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

export function Settings({ project }: { project: Project }) {
  // const projectsManager = useProjectsManager();
  const t = useTranslations();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteProjectFolder, setDeleteProjectFolder] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [projectName, setProjectName] = useState(project.name);
  const isProjectNameEmpty = useMemo(
    () => projectName.length === 0,
    [projectName],
  );
  const [isDirectoryHovered, setIsDirectoryHovered] = useState(false);

  useEffect(() => {
    setProjectName(project.name);
  }, [project.name]);

  const handleDeleteProject = () => {
    // projectsManager.deleteProject(project, deleteProjectFolder);
    setShowDeleteDialog(false);
  };

  const handleRenameProject = () => {
    // projectsManager.updateProject({ ...project, name: projectName });
    setShowRenameDialog(false);
  };

  const handleOpenProjectFolder = () => {
    if (project.folderPath) {
      // invokeMainChannel(MainChannels.OPEN_IN_EXPLORER, project.folderPath);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="default"
            variant="ghost"
            className="w-full gap-2 lg:w-auto"
          >
            <Icons.DotsVertical />
            <p>{t("projects.actions.projectSettings")}</p>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onSelect={handleOpenProjectFolder}
            onMouseEnter={() => setIsDirectoryHovered(true)}
            onMouseLeave={() => setIsDirectoryHovered(false)}
            className="text-foreground-active hover:!bg-background-analogia hover:!text-foreground-active gap-2"
          >
            {isDirectoryHovered ? (
              <Icons.DirectoryOpen className="h-4 w-4" />
            ) : (
              <Icons.Directory className="h-4 w-4" />
            )}
            {t("projects.actions.showInExplorer")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => setShowRenameDialog(true)}
            className="text-foreground-active hover:!bg-background-analogia hover:!text-foreground-active gap-2"
          >
            <Icons.Pencil className="h-4 w-4" />
            {t("projects.actions.renameProject")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => setShowDeleteDialog(true)}
            className="gap-2 text-red-400 hover:!bg-red-200/80 hover:!text-red-700 dark:text-red-200 dark:hover:!bg-red-800 dark:hover:!text-red-100"
          >
            <Icons.Trash className="h-4 w-4" />
            {t("projects.actions.deleteProject")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("projects.dialogs.delete.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("projects.dialogs.delete.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="deleteFolder"
              checked={deleteProjectFolder}
              onCheckedChange={(checked) =>
                setDeleteProjectFolder(checked as boolean)
              }
            />
            <Label htmlFor="deleteFolder">
              {t("projects.dialogs.delete.moveToTrash")}
            </Label>
          </div>
          <AlertDialogFooter>
            <Button
              variant={"ghost"}
              onClick={() => setShowDeleteDialog(false)}
            >
              {t("projects.actions.cancel")}
            </Button>
            <Button
              variant={"destructive"}
              className="rounded-md text-sm"
              onClick={handleDeleteProject}
            >
              {t("projects.actions.delete")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("projects.dialogs.rename.title")}
            </AlertDialogTitle>
          </AlertDialogHeader>
          <div className="flex w-full flex-col gap-2">
            <Label htmlFor="text">{t("projects.dialogs.rename.label")}</Label>
            <Input
              minLength={0}
              type="text"
              value={projectName || ""}
              onInput={(e) => setProjectName(e.currentTarget.value)}
            />
            <p
              className={cn(
                "text-xs text-red-500 transition-opacity",
                isProjectNameEmpty ? "opacity-100" : "opacity-0",
              )}
            >
              {t("projects.dialogs.rename.error")}
            </p>
          </div>
          <AlertDialogFooter>
            <Button
              variant={"ghost"}
              onClick={() => setShowRenameDialog(false)}
            >
              {t("projects.actions.cancel")}
            </Button>
            <Button
              disabled={isProjectNameEmpty}
              className="rounded-md text-sm"
              onClick={handleRenameProject}
            >
              {t("projects.actions.rename")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
