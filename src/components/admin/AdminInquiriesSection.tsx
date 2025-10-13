"use client";

import React from "react";
import { toast } from "sonner";
import { FaTrash, FaSync } from "react-icons/fa";
import { IInquiry } from "@/lib/firebase-models";

interface AdminInquiriesSectionProps {
  inquiries: (IInquiry & { id: string })[];
  totalInquiries: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  loading: boolean;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  onDeleteInquiry: (id: string) => Promise<void>;
}

export default function AdminInquiriesSection({
  inquiries,
  totalInquiries,
  currentPage,
  totalPages,
  pageSize,
  loading,
  onPageChange,
  onRefresh,
  onDeleteInquiry,
}: AdminInquiriesSectionProps) {
  const handleDeleteInquiry = async (inquiryId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this inquiry? This action cannot be undone."
      )
    ) {
      try {
        await onDeleteInquiry(inquiryId);
        toast.success("Inquiry deleted successfully");
      } catch {
        toast.error("Failed to delete inquiry");
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-[#0D3B66] via-[#154A8A] to-[#1E5CAF] rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-3xl font-bold mb-2 flex items-center space-x-3">
                <span>Customer Problems</span>
              </h3>
              <p className="text-white/80 text-lg">
                Look at problems customers are facing
              </p>
            </div>
            <button
              onClick={onRefresh}
              className="group p-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-all duration-300 transform hover:scale-105"
              disabled={loading}
              title="Refresh inquiries"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
              ) : (
                <FaSync className="text-xl" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-900">
                  Contact Info
                </th>
                <th className="text-left p-4 font-semibold text-gray-900">
                  Problem
                </th>
                <th className="text-left p-4 font-semibold text-gray-900">
                  Date
                </th>
                <th className="text-right p-4 font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inquiry) => (
                <tr className="border-t hover:bg-gray-50" key={inquiry.id}>
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-gray-900">
                        {inquiry.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {inquiry.email}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="max-w-xs">
                      <p className="text-sm text-gray-900">{inquiry.message}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-gray-500">
                      {(() => {
                        try {
                          const date =
                            inquiry.createdAt &&
                            typeof inquiry.createdAt === "object" &&
                            "toDate" in inquiry.createdAt
                              ? (
                                  inquiry.createdAt as { toDate(): Date }
                                ).toDate()
                              : new Date(inquiry.createdAt);
                          return date.toLocaleDateString();
                        } catch {
                          return "Invalid Date";
                        }
                      })()}
                      <div className="text-xs text-gray-400">
                        {(() => {
                          try {
                            const date =
                              inquiry.createdAt &&
                              typeof inquiry.createdAt === "object" &&
                              "toDate" in inquiry.createdAt
                                ? (
                                    inquiry.createdAt as { toDate(): Date }
                                  ).toDate()
                                : new Date(inquiry.createdAt);
                            return date.toLocaleTimeString();
                          } catch {
                            return "Invalid Time";
                          }
                        })()}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleDeleteInquiry(inquiry.id!)}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-6 border-t bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {(currentPage - 1) * pageSize + 1} to{" "}
                {Math.min(currentPage * pageSize, totalInquiries)} of{" "}
                {totalInquiries} inquiries
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {/* Page Numbers */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => onPageChange(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg ${
                          currentPage === pageNum
                            ? "bg-[#0D3B66] text-white"
                            : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
