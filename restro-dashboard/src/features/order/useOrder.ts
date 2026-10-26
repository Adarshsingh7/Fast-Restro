import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { order } from "./order";
import { Order } from "@/types/orderType";
import { toast } from "sonner";
import { User } from "@/type";

const useOrders = () => {
  const { data: authUser } = useQuery<User>({ queryKey: ["user"] });
  const {
    data: orders,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: () => order.getAllOrders(authUser?._id),
    enabled: !!authUser?._id,
  });

  return { orders, isLoading, isError };
};

const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  const { mutateAsync } = useMutation({
    mutationFn: ({
      id,
      updatedData,
    }: {
      id: string;
      updatedData: Partial<Order>;
    }) => order.updateOrder(id, updatedData),
    onSuccess: () => {
      toast.success("Order updated successfully");
      queryClient.invalidateQueries(["orders"]);
      // Handle success
    },
    onError: (error: unknown) => {
      // Handle error
      console.log(error);
      toast.error("Failed to update order");
    },
  });

  return {
    updateOrder: mutateAsync,
  };
};

const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: ({ id }: { id: string }) => order.deleteOrder(id),
    onSuccess: () => {
      toast.success("Order deleted successfully");
      queryClient.invalidateQueries(["orders"]);
      // Handle success
    },
    onError: (error: unknown) => {
      // Handle error
      console.log(error);
      toast.error("Failed to delete order");
    },
  });

  return {
    deleteOrder: mutateAsync,
  };
};

export { useUpdateOrder, useOrders, useDeleteOrder };
