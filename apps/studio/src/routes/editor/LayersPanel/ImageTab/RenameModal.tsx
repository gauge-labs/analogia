import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@analogia/ui/alert-dialog';
import { Button } from '@analogia/ui/button';
import { observer } from 'mobx-react-lite';

const RenameImageModal = observer(
    ({
        isOpen,
        toggleOpen,
        onRename,
        newName,
    }: {
        isOpen: boolean;
        toggleOpen: () => void;
        onRename: (newName: string) => void;
        newName: string;
    }) => {
        return (
            <AlertDialog open={isOpen} onOpenChange={toggleOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Rename Image</AlertDialogTitle>
                        <AlertDialogDescription>
                            {`Rename image to "${newName}"`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Button variant={'ghost'} onClick={toggleOpen}>
                            Cancel
                        </Button>
                        <Button variant={'default'} onClick={() => onRename(newName)}>
                            Rename
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        );
    },
);

export default RenameImageModal;
