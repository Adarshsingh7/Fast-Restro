import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { socket } from "@/lib/socket";
import { notifyAdmin } from "@/lib/notify";
import { Order } from "@/types/orderType";
import { User } from "@/type";

const useSocketStatus = () => {
  const [connected, setConnected] = useState(socket.connected);

  useEffect(() => {
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return connected;
};

// Keeps the ["orders"] cache in sync with the API and queues new orders for the popup.
const useOrderSocket = () => {
  const queryClient = useQueryClient();
  const { data: authUser } = useQuery<User>({ queryKey: ["user"] });
  const [incoming, setIncoming] = useState<Order[]>([]);
  const restroId = authUser?._id;

  useEffect(() => {
    if (!restroId) return;

    const join = () => socket.emit("join:restro", restroId);
    join();

    const onNew = (order: Order) => {
      queryClient.setQueryData<Order[]>(["orders"], (old) =>
        old?.some((o) => o._id === order._id) ? old : [order, ...(old ?? [])],
      );
      setIncoming((q) => (q.some((o) => o._id === order._id) ? q : [...q, order]));

      const count = order.items.reduce((n, i) => n + i.quantity, 0);
      notifyAdmin({
        tag: `order-${order._id}`,
        title: `New order from ${order.recipientName}`,
        body: `${count} item${count === 1 ? "" : "s"} · ₹${order.totalAmount} · ${order.delivery}`,
        url: "/dashboard/order",
        // The popup already shows this order on screen.
        silentInApp: true,
      });
    };

    const onUpdated = (order: Order) => {
      queryClient.setQueryData<Order[]>(["orders"], (old) =>
        old?.some((o) => o._id === order._id)
          ? old.map((o) => (o._id === order._id ? order : o))
          : [order, ...(old ?? [])],
      );
      // Once an order leaves "new" (accepted elsewhere), it no longer needs the popup.
      if (order.status !== "new")
        setIncoming((q) => q.filter((o) => o._id !== order._id));
    };

    const onDeleted = ({ _id }: { _id: string }) => {
      queryClient.setQueryData<Order[]>(["orders"], (old) =>
        old?.filter((o) => o._id !== _id),
      );
      setIncoming((q) => q.filter((o) => o._id !== _id));
    };

    socket.on("connect", join);
    socket.on("order:new", onNew);
    socket.on("order:updated", onUpdated);
    socket.on("order:deleted", onDeleted);
    return () => {
      socket.off("connect", join);
      socket.off("order:new", onNew);
      socket.off("order:updated", onUpdated);
      socket.off("order:deleted", onDeleted);
    };
  }, [restroId, queryClient]);

  const dismiss = (id: string) =>
    setIncoming((q) => q.filter((o) => o._id !== id));

  return { incoming, dismiss };
};

export { useOrderSocket, useSocketStatus };
