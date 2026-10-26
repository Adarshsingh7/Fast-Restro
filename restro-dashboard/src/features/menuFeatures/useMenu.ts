import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MenuItem } from "../../types/menuType";
import { menu } from "./menuFeatures";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { User } from "@/type";

const useMenu = () => {
  const { data: authUser } = useQuery<User>({ queryKey: ["user"] });

  const { data, isLoading, error } = useQuery<MenuItem[]>({
    queryKey: ["menuItem"],
    queryFn: () => menu.getAllMenu(authUser?._id),
    enabled: !!authUser?._id,
  });
  return { data, isLoading, error };
};

const useUpdateMenuItem = () => {
  const queryClient = useQueryClient();
  const { mutateAsync, isLoading } = useMutation({
    mutationFn: ({
      id,
      updatedData,
    }: {
      id: string;
      updatedData: Partial<MenuItem> | FormData;
    }) => menu.updateMenu(id, updatedData),
    onSuccess: () => {
      toast.success("MenuItem updated successfully");
      queryClient.invalidateQueries(["menuItem"]);
      // Handle success
    },
    onError: (error: AxiosError<{ message: string }>) => {
      // Handle error
      console.log(error);
      toast.error(error?.response?.data?.message);
    },
  });

  return {
    updateMenuItem: mutateAsync,
    isLoading,
  };
};

const useDeleteMenuItem = () => {
  const queryClient = useQueryClient();
  const { mutateAsync, isLoading } = useMutation({
    mutationFn: ({ id }: { id: string }) => menu.deleteMenu(id),
    onSuccess: () => {
      toast.success("Item deleted successfully");
      queryClient.invalidateQueries(["menuItem"]);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      // Handle error
      console.log(error);
      toast.error("Failed to delete menu");
    },
  });

  return {
    deleteMenuItem: mutateAsync,
    isLoading,
  };
};

const useAddProduct = () => {
  const queryClient = useQueryClient();
  const { data: user } = useQuery<User>({ queryKey: ["user"] });

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: ({ data }: { data: Partial<MenuItem> | FormData }) =>
      menu.createMenu({ ...data, owner: user?._id }),
    onSuccess: () => {
      toast.success("Product added successfully");
      queryClient.invalidateQueries(["menuItem"]);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      // Handle error
      console.log(error);
      toast.error(
        error?.response?.data?.message || "failed to add the menu item",
      );
    },
  });

  return {
    addProduct: mutateAsync,
    isLoading,
  };
};

export { useUpdateMenuItem, useMenu, useDeleteMenuItem, useAddProduct };
