import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { socket } from "../../lib/socket";
import { isFinished, notifyOrderStatus } from "../../lib/notify";
import { order as orderService } from "./order";
import { Order } from "../../types/orderType";
import { getAllLocalEntries } from "../../utils/manageLocalEntry";

// Statuses already announced, shared by every instance of the hook so the
// same change is never alerted twice on one page.
const announced: Record<string, Order["status"]> = {};

// Orders placed from this browser that the restaurant has not finished yet.
// Used for the "track your order" bar, and kept live over the socket.
//
// Only unfinished orders are followed, so once an order is completed or
// cancelled this browser stops listening and stops alerting until the next
// order is placed here.
const useOngoingOrders = () => {
  const queryClient = useQueryClient();
  const ids = getAllLocalEntries(7);
  const key = ["myOrders", ids.join(",")];

  const { data } = useQuery<Order[]>({
    queryKey: key,
    queryFn: async () => {
      const results = await Promise.allSettled(
        ids.map((id) => orderService.getOrder(id)),
      );
      return results
        .filter(
          (r): r is PromiseFulfilledResult<Order> => r.status === "fulfilled",
        )
        .map((r) => r.value);
    },
    enabled: ids.length > 0,
    staleTime: 30 * 1000,
  });

  const ongoing = (data ?? [])
    .filter((o) => !isFinished(o.status))
    .sort(
      (a, b) =>
        new Date(b.createdAt ?? 0).getTime() -
        new Date(a.createdAt ?? 0).getTime(),
    );

  // Rooms are joined per unfinished order, so a finished one is dropped.
  const followed = ongoing.map((o) => o._id).join(",");

  useEffect(() => {
    const followedIds = followed ? followed.split(",") : [];
    if (!followedIds.length) return;

    const join = () => followedIds.forEach((id) => socket.emit("join:order", id));

    const onUpdated = (updated: Order) => {
      if (!followedIds.includes(updated._id)) return;

      const previous = queryClient
        .getQueryData<Order[]>(key)
        ?.find((o) => o._id === updated._id)?.status;

      queryClient.setQueryData<Order[]>(key, (old) =>
        old?.map((o) => (o._id === updated._id ? updated : o)),
      );
      queryClient.setQueryData(["order", updated._id], updated);

      const changed =
        previous !== updated.status &&
        announced[updated._id] !== updated.status;

      if (changed) {
        announced[updated._id] = updated.status;
        notifyOrderStatus(updated);
      }
    };

    join();
    socket.on("connect", join);
    socket.on("order:updated", onUpdated);
    return () => {
      followedIds.forEach((id) => socket.emit("leave:order", id));
      socket.off("connect", join);
      socket.off("order:updated", onUpdated);
    };
    // `followed` is the list of orders still worth listening to.
  }, [followed, queryClient, key.join("|")]);

  return { ongoing, all: data ?? [] };
};

export { useOngoingOrders };
