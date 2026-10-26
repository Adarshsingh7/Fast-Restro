import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import LocalStorageHandler from "../../utils/LocalStorageHandler";

export interface PublicRestro {
  _id: string;
  restroName?: string;
  restroAddress?: string;
  restroLogo?: string;
  paymentQr?: string;
  upiId?: string;
}

// Public profile of a restaurant: name, address, logo and payment QR only.
const getPublicRestro = async (id: string): Promise<PublicRestro> => {
  const { data } = await axios.get<{ data: { data: PublicRestro } }>(
    `${import.meta.env.VITE_API_URL}/api/v1/users/public/${id}`,
  );
  return data.data.data;
};

// On the menu the id is in the URL; on an order page it is the one last visited.
const useRestro = (idFromProps?: string) => {
  const { restroId } = useParams();
  const id =
    idFromProps ??
    restroId ??
    LocalStorageHandler.get<string>("restroId") ??
    undefined;

  const { data, isLoading } = useQuery<PublicRestro>({
    queryKey: ["restro", id],
    queryFn: () => getPublicRestro(id as string),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  return { restro: data, isLoading };
};

export { useRestro };
