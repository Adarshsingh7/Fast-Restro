import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { MenuItem } from "../../types/menuType";

// Menu of one restaurant, looked up by its id rather than by whichever menu
// the browser visited last. An order link opened in a fresh browser still
// resolves its item names this way.
const useMenusByOwner = (ownerId?: string) => {
  const { data, isLoading } = useQuery<MenuItem[]>({
    queryKey: ["menus", ownerId],
    queryFn: async () => {
      const { data } = await axios.get<{ data: { data: MenuItem[] } }>(
        `${import.meta.env.VITE_API_URL}/api/v1/menus?owner=${ownerId}`,
      );
      return data.data.data;
    },
    enabled: !!ownerId,
    staleTime: 5 * 60 * 1000,
  });

  return { menus: data, isLoading };
};

export { useMenusByOwner };
