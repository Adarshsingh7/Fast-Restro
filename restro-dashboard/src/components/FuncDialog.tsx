import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface Props {
  children: React.ReactNode;
  open: boolean;
  onOpenForm: () => void;
  onCloseForm: () => void;
}

export function FuncDialog({ children, open, onOpenForm, onCloseForm }: Props) {
  function handleChangeFormState(val: boolean) {
    if (val) {
      onOpenForm();
    } else {
      onCloseForm();
    }
  }
  return (
    <Dialog open={open} onOpenChange={handleChangeFormState}>
      <DialogTitle></DialogTitle>
      <DialogContent className="bg-white w-fit max-w-full">
        {children}
      </DialogContent>
    </Dialog>
  );
}
