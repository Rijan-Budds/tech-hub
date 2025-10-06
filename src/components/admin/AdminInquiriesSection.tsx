"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { FaReply, FaTrash, FaEye, FaEyeSlash, FaCheck, FaClock, FaTimes, FaSpinner } from "react-icons/fa";
import { IInquiry } from "@/lib/firebase-models";

interface AdminInquiriesSectionProps {
  inquiries: (IInquiry & { id: string })[];
  totalInquiries: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  statusFilter: string;
  sortBy: string;
  sortOrder: string;
  loading: boolean;
  onPageChange: (page: number) => void;
  onStatusFilterChange: (status: string) => void;
  onSortChange: (sortBy: string, sortOrder: string) => void;
  onRefresh: () => void;
  onUpdateInquiry: (id: string, data: { status?: "pending" | "in-progress" | "resolved" | "closed"; adminResponse?: string; respondedBy?: string }) => Promise<void>;
  onDeleteInquiry: (id: string) => Promise<void>;
}

export default function AdminInquiriesSection({
  inquiries,
  totalInquiries,
  currentPage,
  totalPages,
  pageSize,
  statusFilter,
  sortBy,
  sortOrder,
  loading,
  onPageChange,
  onStatusFilterChange,
  onSortChange,
  onRefresh,
  onUpdateInquiry,
  onDeleteInquiry
}: AdminInquiriesSectionProps) {
  const [expandedInquiries, setExpandedInquiries] = useState<Set<string>>(new Set());
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Helper function to safely format dates
  const formatDate = (dateValue: Date | { toDate(): Date } | string | number | null | undefined): Date => {
    if (!dateValue) return new Date();
    
    // If it's already a Date
    if (dateValue instanceof Date) return dateValue;
    
    // If it has a toDate method (Timestamp)
    if (dateValue && typeof dateValue === 'object' && 'toDate' in dateValue) {
      const timestampValue = dateValue as { toDate(): Date };
      return timestampValue.toDate();
    }
    
    // Try to parse as regular date
    try {
      return new Date(dateValue);
    } catch {
      return new Date();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <FaClock className="text-yellow-600" />;
      case "in-progress":
        return <FaSpinner className="text-blue-600 animate-spin" />;
      case "resolved":
        return <FaCheck className="text-green-600" />;
      case "closed":
        return <FaTimes className="text-gray-600" />;
      default:
        return <FaClock className="text-gray-600" />;
    }
  };

  const toggleInquiryExpansion = (inquiryId: string) => {
    const newExpanded = new Set(expandedInquiries);
    if (newExpanded.has(inquiryId)) {
      newExpanded.delete(inquiryId);
    } else {
      newExpanded.add(inquiryId);
    }
    setExpandedInquiries(newExpanded);
  };

  const handleStatusUpdate = async (inquiryId: string, newStatus: "pending" | "in-progress" | "resolved" | "closed") => {
    if (updatingStatus) return;
    
    setUpdatingStatus(inquiryId);
    try {
      await onUpdateInquiry(inquiryId, { status: newStatus });
      toast.success(`Inquiry status updated to ${newStatus}`);
    } catch {
      toast.error("Failed to update inquiry status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleResponseSubmit = async (inquiryId: string) => {
    if (!responseText.trim()) {
      toast.error("Please enter a response");
      return;
    }

    try {
      await onUpdateInquiry(inquiryId, {
        adminResponse: responseText.trim(),
        respondedBy: "Admin", // You might want to pass actual admin user info
        status: "resolved" // Auto-mark as resolved when responding
      });
      
      toast.success("Response sent successfully");
      setRespondingTo(null);
      setResponseText("");
    } catch {
      toast.error("Failed to send response");
    }
  };

  const handleDeleteInquiry = async (inquiryId: string) => {
    if (window.confirm("Are you sure you want to delete this inquiry? This action cannot be undone.")) {
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
      {/* Header Section with Gradient */}
      <div className="bg-gradient-to-br from-[#0D3B66] via-[#154A8A] to-[#1E5CAF] rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-3xl font-bold mb-2 flex items-center space-x-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <FaReply className="text-2xl" />
                </div>
                <span>Customer Inquiries</span>
              </h3>
              <p className="text-white/80 text-lg">
                Manage and respond to customer contact requests
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
                <FaSpinner className="text-xl group-hover:rotate-180 transition-transform duration-500" />
              )}
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold">{totalInquiries}</div>
              <div className="text-white/80 text-sm">Total Inquiries</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold text-yellow-300">
                {inquiries.filter(i => i.status === "pending").length}
              </div>
              <div className="text-white/80 text-sm">Pending</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold text-blue-300">
                {inquiries.filter(i => i.status === "in-progress").length}
              </div>
              <div className="text-white/80 text-sm">In Progress</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold text-green-300">
                {inquiries.filter(i => i.status === "resolved").length}
              </div>
              <div className="text-white/80 text-sm">Resolved</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-6">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center space-x-6">
            {/* Status Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value)}
                className="bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-500"
              >
                <option value="all">📋 All Inquiries</option>
                <option value="pending">🟡 Pending</option>
                <option value="in-progress">🔵 In Progress</option>
                <option value="resolved">🟢 Resolved</option>
                <option value="closed">⚪ Closed</option>
              </select>
            </div>

            {/* Sort Options */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Sort by
              </label>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  onSortChange(field, order);
                }}
                className="bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-500"
              >
                <option value="createdAt-desc">📅 Newest First</option>
                <option value="createdAt-asc">📅 Oldest First</option>
                <option value="status-asc">📊 Status A-Z</option>
                <option value="name-asc">👤 Name A-Z</option>
              </select>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            Showing {Math.min((currentPage - 1) * pageSize + 1, totalInquiries)} to{" "}
            {Math.min(currentPage * pageSize, totalInquiries)} of {totalInquiries} inquiries
          </div>
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-900">Contact Info</th>
                <th className="text-left p-4 font-semibold text-gray-900">Message</th>
                <th className="text-left p-4 font-semibold text-gray-900">Status</th>
                <th className="text-left p-4 font-semibold text-gray-900">Date</th>
                <th className="text-right p-4 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inquiry) => (
                <React.Fragment key={inquiry.id}>
                  <tr className="border-t hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-gray-900">{inquiry.name}</div>
                        <div className="text-sm text-gray-500">{inquiry.email}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-900 line-clamp-2">
                          {inquiry.message}
                        </p>
                        {inquiry.message.length > 100 && (
                          <button
                            onClick={() => toggleInquiryExpansion(inquiry.id!)}
                            className="text-blue-600 hover:text-blue-700 text-xs mt-1 flex items-center space-x-1"
                          >
                            {expandedInquiries.has(inquiry.id!) ? (
                              <>
                                <FaEyeSlash /> <span>Show less</span>
                              </>
                            ) : (
                              <>
                                <FaEye /> <span>Show more</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(inquiry.status)}
                        <select
                          value={inquiry.status}
                          onChange={(e) => handleStatusUpdate(inquiry.id!, e.target.value as "pending" | "in-progress" | "resolved" | "closed")}
                          disabled={updatingStatus === inquiry.id}
                          className={`text-xs font-medium px-2 py-1 rounded-full border-0 ${getStatusColor(inquiry.status)} ${
                            updatingStatus === inquiry.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-500">
                        {formatDate(inquiry.createdAt).toLocaleDateString()}
                        <div className="text-xs text-gray-400">
                          {formatDate(inquiry.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            if (respondingTo === inquiry.id) {
                              setRespondingTo(null);
                              setResponseText("");
                            } else {
                              setRespondingTo(inquiry.id!);
                              setResponseText(inquiry.adminResponse || "");
                            }
                          }}
                          className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm flex items-center space-x-1"
                        >
                          <FaReply />
                          <span>{inquiry.adminResponse ? 'Edit Reply' : 'Reply'}</span>
                        </button>
                        <button
                          onClick={() => handleDeleteInquiry(inquiry.id!)}
                          className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Message View */}
                  {expandedInquiries.has(inquiry.id!) && (
                    <tr className="border-t bg-gray-50">
                      <td colSpan={5} className="p-4">
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <h4 className="font-medium text-gray-900 mb-2">Full Message:</h4>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{inquiry.message}</p>
                          {inquiry.adminResponse && (
                            <div className="mt-4 pt-4 border-t">
                              <h4 className="font-medium text-gray-900 mb-2">Admin Response:</h4>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{inquiry.adminResponse}</p>
                              <div className="text-xs text-gray-500 mt-2">
                                Responded on {inquiry.respondedAt ? formatDate(inquiry.respondedAt).toLocaleString() : 'Unknown'}
                                {inquiry.respondedBy && ` by ${inquiry.respondedBy}`}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Response Form */}
                  {respondingTo === inquiry.id && (
                    <tr className="border-t bg-blue-50">
                      <td colSpan={5} className="p-4">
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <h4 className="font-medium text-gray-900 mb-3">
                            {inquiry.adminResponse ? 'Edit Response' : 'Send Response'} to {inquiry.name}
                          </h4>
                          <textarea
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            placeholder="Type your response here..."
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            rows={4}
                          />
                          <div className="flex justify-end space-x-3 mt-3">
                            <button
                              onClick={() => {
                                setRespondingTo(null);
                                setResponseText("");
                              }}
                              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleResponseSubmit(inquiry.id!)}
                              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm flex items-center space-x-2"
                            >
                              <FaReply />
                              <span>Send Response</span>
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
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
                {Math.min(currentPage * pageSize, totalInquiries)} of {totalInquiries} inquiries
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