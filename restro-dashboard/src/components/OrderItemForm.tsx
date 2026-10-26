import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMenu } from "@/features/menuFeatures/useMenu";
import { Order } from "@/types/orderType";
import CenteredLoader from "@/ui/CenteredLoader";
import { MenuItem } from "@/types/menuType";
import { useUpdateOrder } from "@/features/order/useOrder";

interface Props {
  initialData: Order;
}

export default function CompactOrderDetails({ initialData }: Props) {
  const [order, setOrder] = useState<Order>(initialData);
  const [currentSlide, setCurrentSlide] = useState(0);
  const itemsPerSlide = 3; // Number of items visible at once

  const { updateOrder } = useUpdateOrder();

  function getOrderedMenuItems(
    menuItems: MenuItem[],
    initialData: Order,
  ): MenuItem[] {
    const orderedItemIds = new Set(
      initialData.items.map((item) => item.menuItem),
    );

    const orderedMenuItems = menuItems
      .filter((menuItem) => orderedItemIds.has(menuItem._id))
      .map((menuItem) => ({
        ...menuItem,
      }));

    return orderedMenuItems;
  }

  const { data: menuItems, isLoading } = useMenu();
  const filteredMenuItems = getOrderedMenuItems(menuItems || [], initialData);
  // Calculate total number of slides
  const totalSlides = Math.ceil(filteredMenuItems.length / itemsPerSlide);
  // Status options
  const statusOptions = ["new", "preparing", "completed", "cancelled"];
  const paymentStatusOptions = ["pending", "paid", "failed"];

  function getQuantityByMenuItemId(menuItemId: string): number {
    const itemEntry = initialData.items.find(
      (item) => item.menuItem === menuItemId,
    );
    return itemEntry ? itemEntry.quantity : 0; // return 0 if not found
  }

  // Handlers
  const handleStatusChange = (
    newStatus: "new" | "preparing" | "completed" | "cancelled",
  ) => {
    setOrder({ ...order, status: newStatus });
  };

  const handlePaymentStatusChange = (
    newStatus: "pending" | "paid" | "failed",
  ) => {
    setOrder({ ...order, paymentStatus: newStatus });
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  // Get current slide items
  const getCurrentSlideItems = () => {
    const startIndex = currentSlide * itemsPerSlide;
    const endIndex = Math.min(
      startIndex + itemsPerSlide,
      filteredMenuItems.length,
    );
    return filteredMenuItems.slice(startIndex, endIndex);
  };

  // Status badge styles
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "preparing":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-purple-100 text-purple-800";
      case "paid":
        return "bg-emerald-100 text-emerald-800";
      case "failed":
        return "bg-rose-100 text-rose-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) return <CenteredLoader />;

  // Get the items for the current slide
  const currentSlideItems = getCurrentSlideItems();

  return (
    <div className="w-full mx-auto p-4 bg-white rounded-lg shadow h-[90vh] overflow-auto">
      {/* Header with Order ID and Status */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-bold">Order #{order._id}</h1>
        <Badge
          className={`px-2 py-1 text-xs ${getStatusBadgeStyle(order.status)}`}
        >
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </Badge>
      </div>

      {/* Product Slider */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-md font-bold">Ordered Products</h2>
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-500">
              {currentSlide + 1}/{totalSlides}
            </span>
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={prevSlide}
                disabled={totalSlides <= 1}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={nextSlide}
                disabled={totalSlides <= 1}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {currentSlideItems.map((item) => (
            <div key={item._id} className="relative">
              <div className="aspect-square overflow-hidden rounded-md shadow-sm">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-1 text-xs">
                {item.name} × {getQuantityByMenuItemId(item._id)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Details Section */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Left Column: Recipient Details */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold pb-1 border-b">
                Recipient Details
              </h3>

              <div>
                <h4 className="text-xs font-medium text-gray-500">Name</h4>
                <p className="text-sm">{order.recipientName}</p>
              </div>

              <div>
                <h4 className="text-xs font-medium text-gray-500">Email</h4>
                <p className="text-sm truncate">{order.recipientEmail}</p>
              </div>

              <div>
                <h4 className="text-xs font-medium text-gray-500">Phone</h4>
                <p className="text-sm">{order.recipientPhoneNumber}</p>
              </div>
            </div>

            {/* Right Column: Order Management */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold pb-1 border-b">
                Order Details
              </h3>

              <div>
                <h4 className="text-xs font-medium text-gray-500 mb-1">
                  Payment Status
                </h4>
                <Select
                  value={order.paymentStatus}
                  onValueChange={(value) => {
                    handlePaymentStatusChange(
                      value as "pending" | "paid" | "failed",
                    );
                    updateOrder({
                      id: order._id,
                      updatedData: {
                        ...order,
                        update: true,
                        paymentStatus: value as "pending" | "paid" | "failed",
                      },
                    });
                  }}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentStatusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h4 className="text-xs font-medium text-gray-500 mb-1">
                  Order Status
                </h4>
                <Select
                  value={order.status}
                  onValueChange={(value) => {
                    handleStatusChange(
                      value as "new" | "preparing" | "completed" | "cancelled",
                    );
                    const updatedItems = order.items.map((item) => {
                      const menuItemData = filteredMenuItems.find(
                        (menu) => menu._id === item.menuItem,
                      );
                      return {
                        ...item,
                        name: menuItemData ? menuItemData.name : "Unknown",
                      };
                    });
                    order.items = updatedItems;
                    updateOrder({
                      id: order._id,
                      updatedData: {
                        ...order,
                        status: value as
                          | "new"
                          | "preparing"
                          | "completed"
                          | "cancelled",
                      },
                    });
                  }}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h4 className="text-xs font-medium text-gray-500">
                  Total Amount
                </h4>
                <p className="text-base font-bold">₹{order.totalAmount}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Items Table */}
      <div className="mt-4">
        <h3 className="text-md font-bold mb-2">Order Items</h3>
        <div className="border rounded-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qty
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMenuItems.map((item) => (
                <tr key={item._id}>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    {item.name}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-right">
                    {getQuantityByMenuItemId(item._id)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-right">
                    ₹{item.price}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50">
                <td
                  className="px-3 py-2 whitespace-nowrap text-sm font-bold"
                  colSpan={2}
                >
                  Total
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-right">
                  ₹{order.totalAmount}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
