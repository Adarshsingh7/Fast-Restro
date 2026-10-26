import RichTable from "@/components/RichTable";
import { useDialog } from "@/context/DialogContext";

import { FC, useState } from "react";
import CenteredLoader from "@/ui/CenteredLoader";
import { FuncDialog } from "@/components/FuncDialog";
import MenuItemForm from "@/components/MenuItemForm";
import { useDeleteMenuItem, useMenu } from "@/features/menuFeatures/useMenu";
import { MenuItem } from "@/types/menuType";

const Product: FC = () => {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { openDeleteDialog } = useDialog();
  const { deleteMenuItem } = useDeleteMenuItem();

  const mapping = [
    { label: "Name", field: "name" },
    { label: "Category", field: "category" },
    { label: "Preparation Time", field: "preparationTime" },
    { label: "Price", field: "price" },
    { label: "Stock", field: "stock" },
  ];

  const { data: initialData, isLoading } = useMenu();
  if (isLoading) return <CenteredLoader />;

  const handleDelete = (id: string) => {
    openDeleteDialog(() => deleteMenuItem({ id }));
  };

  const handleEdit = (id: string) => {
    setIsFormOpen(true);
    if (!initialData) return;
    const selected =
      initialData.find((item: MenuItem) => item._id === id) || null;
    setSelectedItem(selected);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  const handleOpenForm = () => {
    setIsFormOpen(true);
    setSelectedItem(null);
  };

  return (
    <div className="flex flex-col gap-10">
      {isFormOpen ? (
        <FuncDialog
          open={isFormOpen}
          onCloseForm={handleCloseForm}
          onOpenForm={handleOpenForm}
        >
          <MenuItemForm
            initialData={selectedItem}
            onCancel={() => setIsFormOpen(false)}
            onCloseForm={() => setIsFormOpen(false)}
          />
        </FuncDialog>
      ) : null}
      {initialData ? (
        <RichTable
          onAddDataOpen={handleOpenForm}
          initialData={initialData}
          mapping={mapping}
          onDelete={(id: string) => handleDelete(id)}
          label="Employee List"
          onEdit={handleEdit}
        />
      ) : null}
    </div>
  );
};

export default Product;
