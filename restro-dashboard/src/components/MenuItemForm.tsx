import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImagePlus, Link as LinkIcon } from "lucide-react";
import { MenuItem } from "@/types/menuType";
import {
  useAddProduct,
  useUpdateMenuItem,
} from "@/features/menuFeatures/useMenu";
import CenteredLoader from "@/ui/CenteredLoader";

type Props = {
  initialData?: MenuItem | null;
  onCloseForm: () => void;
  onCancel: () => void;
};

const MenuItemForm = ({ initialData = null, onCancel }: Props) => {
  const [imageUploadType, setImageUploadType] = useState<"url" | "file">("url");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  console.log(imageUploadType);

  const { addProduct: createMenuItem, isLoading: creating } = useAddProduct();
  const { updateMenuItem, isLoading: updating } = useUpdateMenuItem();

  const form = useForm<Partial<MenuItem>>({
    defaultValues: initialData || {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      preparationTime: 0,
      category: "appetizer",
      image: "",
      file: null,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setSelectedFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const logFormData = (formData: FormData) => {
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }
  };

  const handleFormSubmit = (values: Partial<MenuItem>) => {
    const formData = new FormData();

    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value instanceof File ? value : String(value));
      }
    });

    // If an image file is selected, use FormData (with fieldName)
    if (selectedFile) {
      console.log(selectedFile);
      formData.append("file", selectedFile);
      formData.append("fieldName", "image"); // Required by backend
      logFormData(formData);

      if (values._id) {
        updateMenuItem({ id: values._id, updatedData: formData });
      } else {
        createMenuItem({ data: formData });
      }
    } else {
      // No file selected, send raw values (non-FormData)
      if (values._id) {
        updateMenuItem({ id: values._id, updatedData: values });
      } else {
        createMenuItem({ data: values });
      }
    }
  };

  const handleCancel = () => {
    // Reset form and clear any uploaded files
    form.reset();
    onCancel();
    setSelectedFile(null);
    setImagePreview(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
  };

  if (updating || creating)
    return <CenteredLoader isLoading={updating || creating} />;

  return (
    <Card className="w-full max-w-lg border-0 shadow-none">
      <CardHeader>
        <CardTitle className="text-lg font-medium">
          {initialData ? "Update Menu Item" : "Add Menu Item"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "Name is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Item name"
                      defaultValue={initialData?.name}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              rules={{ required: "Description is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      defaultValue={initialData?.description}
                      placeholder="Item description"
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="price"
                rules={{
                  required: "Price is required",
                  min: { value: 0, message: "Price must be at least 0" },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input
                        defaultValue={initialData?.price}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stock"
                rules={{
                  required: "Stock is required",
                  min: { value: 0, message: "Stock must be at least 0" },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="preparationTime"
                rules={{
                  required: "Preparation time is required",
                  min: {
                    value: 0,
                    message: "Preparation time must be at least 0",
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prep Time (min)</FormLabel>
                    <FormControl>
                      <Input
                        defaultValue={initialData?.preparationTime}
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                rules={{ required: "Category is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={initialData?.category || "appetizer"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="appetizer">Appetizer</SelectItem>
                        <SelectItem value="main course">Main Course</SelectItem>
                        <SelectItem value="dessert">Dessert</SelectItem>
                        <SelectItem value="beverages">Beverages</SelectItem>
                        <SelectItem value="snacks">Snacks</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            </div>

            <FormItem className="space-y-2">
              <FormLabel>Image</FormLabel>
              <Tabs
                defaultValue="url"
                onValueChange={(v) => setImageUploadType(v as "url" | "file")}
              >
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="url">
                    <LinkIcon className="h-4 w-4 mr-2" />
                    URL
                  </TabsTrigger>
                  <TabsTrigger value="file">
                    <ImagePlus className="h-4 w-4 mr-2" />
                    Upload
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="url" className="pt-2">
                  <FormField
                    control={form.control}
                    name="image"
                    rules={{ required: "Image URL is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Enter image URL" {...field} />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                <TabsContent value="file" className="pt-2">
                  <div className="flex flex-col gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                    />
                    <div className="mt-2">
                      {imagePreview && (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-32 w-auto object-cover rounded border"
                        />
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              <FormDescription>Add an image for your menu item</FormDescription>
            </FormItem>

            <CardFooter className="flex justify-between px-0 pt-2 pb-0">
              <Button variant="outline" type="button" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit">{initialData ? "Update" : "Create"}</Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default MenuItemForm;
