import axios, { AxiosError } from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { auth } from "@/features/authMethods";

export type Profile = {
  _id: string;
  username: string;
  email: string;
  phone: string;
  restroName?: string;
  restroAddress?: string;
  restroLogo?: string;
  paymentQr?: string;
  upiId?: string;
};

export type ProfileDetails = Partial<
  Pick<
    Profile,
    "username" | "phone" | "restroName" | "restroAddress" | "upiId"
  >
>;

type ImageKind = "logo" | "paymentQr";

const api = () =>
  axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api/v1/users/me`,
    headers: { Authorization: `Bearer ${auth.getToken()}` },
  });

// Phone photos can be several MB; scale them down before uploading.
const shrinkImage = (file: File, maxSize: number): Promise<Blob> =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      if (scale === 1) return resolve(file);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => resolve(blob ?? file), "image/png");
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });

const errorMessage = (error: unknown, fallback: string) =>
  (error as AxiosError<{ message?: string }>)?.response?.data?.message ??
  fallback;

const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { mutateAsync, isLoading } = useMutation({
    mutationFn: async (details: ProfileDetails) =>
      (await api().patch<{ user: Profile }>("/", details)).data.user,
    onSuccess: (user) => {
      queryClient.setQueryData(["user"], user);
      toast.success("Details saved");
    },
    onError: (error) => toast.error(errorMessage(error, "Could not save details")),
  });
  return { updateProfile: mutateAsync, isSaving: isLoading };
};

const useUploadImage = () => {
  const queryClient = useQueryClient();
  const { mutateAsync, isLoading, variables } = useMutation({
    mutationFn: async ({ kind, file }: { kind: ImageKind; file: File }) => {
      const blob = await shrinkImage(file, kind === "logo" ? 600 : 1200);
      const form = new FormData();
      form.append("file", blob, `${kind}.png`);
      return (await api().post<{ user: Profile }>(`/images/${kind}`, form)).data
        .user;
    },
    onSuccess: (user, { kind }) => {
      queryClient.setQueryData(["user"], user);
      toast.success(kind === "logo" ? "Logo updated" : "Payment QR updated");
    },
    onError: (error) => toast.error(errorMessage(error, "Upload failed")),
  });
  return {
    uploadImage: mutateAsync,
    uploading: isLoading ? variables?.kind : undefined,
  };
};

export { useUpdateProfile, useUploadImage };
