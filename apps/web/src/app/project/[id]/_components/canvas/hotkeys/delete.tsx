// import { useEditorEngine, useUserManager } from '@/components/Context';
import { Hotkey } from "@/components/hotkey";
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
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

export const DeleteKey = () => {
  // const editorEngine = useEditorEngine();
  // const userManager = useUserManager();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  // const [shouldWarnDelete, setShouldWarnDelete] = useState(
  //     userManager.settings.settings?.editor?.shouldWarnDelete ?? true,
  // );

  useHotkeys([Hotkey.BACKSPACE.command, Hotkey.DELETE.command], () => {
    // if (editorEngine.isWindowSelected) {
    //     editorEngine.deleteWindow();
    // } else {
    //     if (shouldWarnDelete) {
    //         setShowDeleteDialog(true);
    //     } else {
    //         editorEngine.elements.delete();
    //     }
    // }
  });

  function disableWarning(disable: boolean) {
    // userManager.settings.updateEditor({ shouldWarnDelete: disable });
    // setShouldWarnDelete(disable);
  }

  const handleDelete = () => {
    // editorEngine.elements.delete();
    setShowDeleteDialog(false);
  };

  return (
    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{"Delete this element?"}</AlertDialogTitle>
          <AlertDialogDescription>
            {"This will delete the element in code. You can undo this action."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="disable-warning"
            onCheckedChange={(checked) => disableWarning(checked !== true)}
          />
          <label
            htmlFor="disable-warning"
            className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {"Don't show this warning again"}
          </label>
        </div>
        <AlertDialogFooter>
          <Button variant={"ghost"} onClick={() => setShowDeleteDialog(false)}>
            Cancel
          </Button>
          <Button
            variant={"destructive"}
            className="rounded-md text-sm"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
