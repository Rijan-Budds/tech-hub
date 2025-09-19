"use client";

import React from "react";
import { FaChevronDown } from "react-icons/fa";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StatusDropdownProps {
  currentStatus:
    | "pending"
    | "processing"
    | "shipped"
    | "out-for-delivery"
    | "delivered"
    | "returned"
    | "canceled";
  orderId: string;
  onStatusChange: (
    orderId: string,
    status:
      | "pending"
      | "processing"
      | "shipped"
      | "out-for-delivery"
      | "delivered"
      | "returned"
      | "canceled",
  ) => void;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({
  currentStatus,
  orderId,
  onStatusChange,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "processing":
        return "bg-blue-500 hover:bg-blue-600";
      case "shipped":
        return "bg-purple-500 hover:bg-purple-600";
      case "out-for-delivery":
        return "bg-indigo-500 hover:bg-indigo-600";
      case "delivered":
        return "bg-green-500 hover:bg-green-600";
      case "returned":
        return "bg-orange-500 hover:bg-orange-600";
      case "canceled":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "processing":
        return "Processing";
      case "shipped":
        return "Shipped";
      case "out-for-delivery":
        return "Out for Delivery";
      case "delivered":
        return "Delivered";
      case "returned":
        return "Returned";
      case "canceled":
        return "Canceled";
      default:
        return "Unknown";
    }
  };

  // Helper function to check if status change is allowed
  const isStatusChangeAllowed = (fromStatus: string, toStatus: string) => {
    // Cannot cancel a delivered or returned order
    if (
      (fromStatus === "delivered" || fromStatus === "returned") &&
      toStatus === "canceled"
    ) {
      return false;
    }

    // Delivered orders can only be marked as returned
    if (
      fromStatus === "delivered" &&
      !["delivered", "returned"].includes(toStatus)
    ) {
      return false;
    }

    // Returned orders can only stay returned
    if (fromStatus === "returned" && toStatus !== "returned") {
      return false;
    }

    // Can't go back to pending once processing
    if (
      [
        "processing",
        "shipped",
        "out-for-delivery",
        "delivered",
        "returned",
      ].includes(fromStatus) &&
      toStatus === "pending"
    ) {
      return false;
    }

    return true;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`px-4 py-2 text-white rounded-lg transition-colors flex items-center space-x-2 ${getStatusColor(currentStatus)}`}
        >
          <span>{getStatusText(currentStatus)}</span>
          <FaChevronDown className="w-3 h-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {[
          { status: "pending", color: "bg-yellow-500", label: "Pending" },
          { status: "processing", color: "bg-blue-500", label: "Processing" },
          { status: "shipped", color: "bg-purple-500", label: "Shipped" },
          {
            status: "out-for-delivery",
            color: "bg-indigo-500",
            label: "Out for Delivery",
          },
          { status: "delivered", color: "bg-green-500", label: "Delivered" },
          { status: "returned", color: "bg-orange-500", label: "Returned" },
          { status: "canceled", color: "bg-red-500", label: "Canceled" },
        ].map(({ status, color, label }) => {
          const isDisabled =
            currentStatus === status ||
            !isStatusChangeAllowed(
              currentStatus,
              status as typeof currentStatus,
            );

          return (
            <DropdownMenuItem
              key={status}
              onClick={() => {
                if (!isDisabled) {
                  onStatusChange(orderId, status as typeof currentStatus);
                }
              }}
              className={`cursor-pointer ${
                isDisabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isDisabled}
            >
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 ${color} rounded-full`}></div>
                <span>
                  {label}
                  {isDisabled && currentStatus !== status && " (Not allowed)"}
                </span>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StatusDropdown;
