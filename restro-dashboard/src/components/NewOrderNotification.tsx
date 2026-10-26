import React from "react";
import { Check, X, Clock } from "lucide-react";

// Define TypeScript types for our data
type FoodItem = {
  name: string;
  quantity: number;
  price: number;
  notes?: string;
};

type Order = {
  id: string;
  recipientName: string;
  dateTime: string;
  status: "pending" | "accepted" | "rejected";
  items: FoodItem[];
  total: number;
  address: string;
};

// Sample data for demonstration
const sampleOrder: Order = {
  id: "ORD-12345",
  recipientName: "John Doe",
  dateTime: "2025-04-28T12:30:00",
  status: "pending",
  items: [
    { name: "Margherita Pizza", quantity: 1, price: 12.99 },
    { name: "Chicken Wings", quantity: 2, price: 8.99, notes: "Extra spicy" },
    { name: "Caesar Salad", quantity: 1, price: 7.5 },
    { name: "Soda", quantity: 2, price: 2.5 },
  ],
  total: 43.47,
  address: "123 Main St, Apt 4B, New York, NY 10001",
};

// Format date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const OrderCard = ({ order = sampleOrder }) => {
  const [status, setStatus] = React.useState(order.status);

  const handleAccept = () => {
    setStatus("accepted");
    // In a real application, you would make an API call here
    console.log(`Order ${order.id} accepted`);
  };

  const handleReject = () => {
    setStatus("rejected");
    // In a real application, you would make an API call here
    console.log(`Order ${order.id} rejected`);
  };

  const getStatusColor = () => {
    switch (status) {
      case "accepted":
        return "text-green-500";
      case "rejected":
        return "text-red-500";
      default:
        return "text-amber-500";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "accepted":
        return <Check size={18} className="text-green-500" />;
      case "rejected":
        return <X size={18} className="text-red-500" />;
      default:
        return <Clock size={18} className="text-amber-500" />;
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Order #{order.id}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatDate(order.dateTime)}
            </p>
          </div>
          <div className={`flex items-center gap-1 ${getStatusColor()}`}>
            {getStatusIcon()}
            <span className="font-medium capitalize">{status}</span>
          </div>
        </div>

        {/* Customer Details */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Recipient:{" "}
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              {order.recipientName}
            </span>
          </div>
          <div className="text-sm mt-1">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Delivery Address:{" "}
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              {order.address}
            </span>
          </div>
        </div>

        {/* Order Items */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            Order Items
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex justify-between text-sm pb-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
              >
                <div>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {item.quantity}x{" "}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {item.name}
                  </span>
                  {item.notes && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {item.notes}
                    </p>
                  )}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 font-medium">
            <span className="text-gray-700 dark:text-gray-300">Total</span>
            <span className="text-gray-900 dark:text-gray-100">
              ${order.total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        {status === "pending" && (
          <div className="p-4 flex gap-2">
            <button
              onClick={handleAccept}
              className="flex-1 py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-medium rounded-md flex items-center justify-center gap-1 transition-colors"
            >
              <Check size={16} />
              Accept
            </button>
            <button
              onClick={handleReject}
              className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded-md flex items-center justify-center gap-1 transition-colors"
            >
              <X size={16} />
              Reject
            </button>
          </div>
        )}

        {status !== "pending" && (
          <div className="p-4">
            <div
              className={`py-2 px-4 rounded-md text-center font-medium ${
                status === "accepted"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              }`}
            >
              Order {status === "accepted" ? "Accepted" : "Rejected"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function OrderStatusCard() {
  return <OrderCard />;
}
