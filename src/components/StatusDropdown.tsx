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
  currentStatus: "pending" | "canceled" | "delivered";
  orderId: string;
  onStatusChange: (orderId: string, status: "pending" | "canceled" | "delivered") => void;
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
      case "delivered":
        return "bg-green-500 hover:bg-green-600";
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
      case "delivered":
        return "Delivered";
      case "canceled":
        return "Canceled";
      default:
        return "Unknown";
    }
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
      <DropdownMenuContent className="w-48">
        <DropdownMenuItem
          onClick={() => onStatusChange(orderId, "pending")}
          className="cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Pending</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onStatusChange(orderId, "delivered")}
          className="cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Delivered</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onStatusChange(orderId, "canceled")}
          className="cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Canceled</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StatusDropdown;
