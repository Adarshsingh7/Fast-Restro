import LocalStorageHandler from "../../utils/LocalStorageHandler";
import { useMenusByOwner } from "./useMenusByOwner";

// The menu of the restaurant currently being browsed. It delegates to
// useMenusByOwner so every component shares one fetch and one cache entry.
export const useMenu = () => {
  const restroId = LocalStorageHandler.get<string>("restroId") ?? undefined;
  const { menus, isLoading } = useMenusByOwner(restroId);

  return { data: menus, isLoading, error: null as Error | null };
};
