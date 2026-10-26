import axios, { AxiosError } from "axios";
import { useState } from "react";
import { toast } from "sonner";
import { auth } from "@/features/authMethods";

// Phone photos are several MB; scale down before uploading.
const shrinkImage = (file: File, maxSize = 900): Promise<Blob> =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      if (scale === 1) return resolve(file);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => resolve(blob ?? file), "image/jpeg", 0.85);
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });

// Uploads one photo and returns its URL, to store on a menu item.
const useItemImage = () => {
  const [uploading, setUploading] = useState(false);

  const uploadItemImage = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", await shrinkImage(file), "item.jpg");
      const { data } = await axios.post<{ data: { url: string } }>(
        `${import.meta.env.VITE_API_URL}/api/v1/uploads`,
        form,
        { headers: { Authorization: `Bearer ${auth.getToken()}` } },
      );
      return data.data.url;
    } catch (error) {
      toast.error(
        (error as AxiosError<{ message?: string }>)?.response?.data?.message ??
          "Could not upload the photo",
      );
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { uploadItemImage, uploading };
};

export { useItemImage };
