"use client";

import React from "react";
import Image from "next/image";
import {
  FaUndo,
  FaSync,
  FaCheck,
  FaTimes,
  FaTrash,
  FaBox,
  FaExclamationTriangle,
  FaUser,
  FaShoppingCart,
} from "react-icons/fa";

interface ReturnRequest {
  id: string;
  orderId: string;
  userId: string;
  items: {
    productId: string;
    quantity: number;
    name?: string;
    image?: string;
    price?: number;
  }[];
  reason: string;
  description?: string;
  images?: string[];
  status: "pending" | "approved" | "rejected" | "completed" | "refunded";
  adminNote?: string;
  requestedAt: Date;
  processedAt?: Date;
  refundAmount?: number;
  refundMethod?: "original" | "store-credit";
  orderDetails?: {
    orderNumber: string;
    grandTotal: number;
    customer: { name: string; email: string };
  };
  userDetails?: {
    username: string;
  };
}

interface AdminReturnsSectionProps {
  returnRequests: ReturnRequest[];
  currentReturnsPage: number;
  returnsPerPage: number;
  totalReturns: number;
  totalReturnsPages: number;
  returnsSortBy: string;
  returnsSortOrder: string;
  returnsStatusFilter: string;
  reloadingReturns: boolean;
  expandedReturns: Set<string>;
  setCurrentReturnsPage: (page: number) => void;
  setReturnsPerPage: (perPage: number) => void;
  setReturnsSortBy: (sortBy: string) => void;
  setReturnsSortOrder: (sortOrder: string) => void;
  setReturnsStatusFilter: (filter: string) => void;
  toggleReturnExpansion: (returnId: string) => void;
  updateReturnStatus: (
    returnId: string,
    status: "pending" | "approved" | "rejected" | "completed" | "refunded",
    adminNote?: string,
    refundAmount?: number,
  ) => void;
  deleteReturnRequest: (returnId: string) => void;
  reloadReturns: () => void;
  getReturnStatusColor: (status: string) => string;
}

export default function AdminReturnsSection({
  returnRequests,
  currentReturnsPage,
  returnsPerPage,
  totalReturns,
  totalReturnsPages,
  returnsSortBy,
  returnsSortOrder,
  returnsStatusFilter,
  reloadingReturns,
  expandedReturns,
  setCurrentReturnsPage,
  setReturnsPerPage,
  setReturnsSortBy,
  setReturnsSortOrder,
  setReturnsStatusFilter,
  toggleReturnExpansion,
  updateReturnStatus,
  deleteReturnRequest,
  reloadReturns,
  getReturnStatusColor,
}: AdminReturnsSectionProps) {
  const getReasonDisplayText = (reason: string) => {
    switch (reason) {
      case "damaged":
        return "Item was damaged";
      case "wrong-item":
        return "Wrong item received";
      case "size-issue":
        return "Size/fit issue";
      case "defective":
        return "Item is defective";
      case "not-as-described":
        return "Not as described";
      case "other":
        return "Other reason";
      default:
        return reason;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section with Gradient */}
      <div className="bg-gradient-to-r from-[#0D3B66] via-[#1E5CAF] to-[#2E7DD2] rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-4 -right-4 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute top-10 -left-8 w-24 h-24 bg-white rounded-full"></div>
          <div className="absolute bottom-4 right-20 w-16 h-16 bg-white rounded-full"></div>
        </div>

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-3xl font-bold mb-2 flex items-center space-x-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <FaUndo className="text-2xl" />
                </div>
                <span>Return Requests Center</span>
              </h3>
              <p className="text-white/80 text-lg">
                Manage customer return and refund requests
              </p>
            </div>
            <button
              onClick={reloadReturns}
              className="group p-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-all duration-300 transform hover:scale-105"
              disabled={reloadingReturns}
              title="Refresh return requests"
            >
              {reloadingReturns ? (
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
              ) : (
                <FaSync className="text-xl group-hover:rotate-180 transition-transform duration-500" />
              )}
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold">{totalReturns}</div>
              <div className="text-white/80 text-sm">Total Requests</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold text-yellow-300">
                {returnRequests.filter((r) => r.status === "pending").length}
              </div>
              <div className="text-white/80 text-sm">Pending</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold text-green-300">
                {returnRequests.filter((r) => r.status === "approved").length}
              </div>
              <div className="text-white/80 text-sm">Approved</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold text-blue-300">
                {
                  returnRequests.filter(
                    (r) => r.status === "completed" || r.status === "refunded",
                  ).length
                }
              </div>
              <div className="text-white/80 text-sm">Completed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Controls Panel */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-6">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center space-x-6">
            {/* Items per page */}
            <div className="flex items-center space-x-3">

              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Show
                </label>
                <select
                  value={returnsPerPage}
                  onChange={(e) => {
                    setReturnsPerPage(Number(e.target.value));
                    setCurrentReturnsPage(1);
                  }}
                  className="ml-2 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-3">
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Filter
                </label>
                <select
                  value={returnsStatusFilter}
                  onChange={(e) => setReturnsStatusFilter(e.target.value)}
                  className="ml-2 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="all">All Requests</option>
                  <option value="pending">🟡 Pending</option>
                  <option value="approved">🟢 Approved</option>
                  <option value="rejected">🔴 Rejected</option>
                  <option value="completed">🔵 Completed</option>
                  <option value="refunded">🟣 Refunded</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            {/* Sort By */}
            <div className="flex items-center space-x-3">
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Sort by
                </label>
                <select
                  value={returnsSortBy}
                  onChange={(e) => {
                    setReturnsSortBy(e.target.value);
                    setCurrentReturnsPage(1);
                  }}
                  className="ml-2 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="requestedAt">📅 Request Date</option>
                  <option value="status">⚡ Status</option>
                  <option value="reason">🔍 Reason</option>
                </select>
              </div>
            </div>

            {/* Sort Order */}
            <div className="flex items-center space-x-3">
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Order
                </label>
                <select
                  value={returnsSortOrder}
                  onChange={(e) => {
                    setReturnsSortOrder(e.target.value);
                    setCurrentReturnsPage(1);
                  }}
                  className="ml-2 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="desc">📈 Latest First</option>
                  <option value="asc">📉 Oldest First</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Return Requests List */}
      {returnRequests.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 rounded-3xl shadow-xl border border-gray-200/50 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="relative mb-8">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center shadow-inner">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-900 rounded-2xl flex items-center justify-center transform rotate-12 shadow-lg">
                  <FaUndo className="text-white text-2xl" />
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-900 rounded-full animate-bounce opacity-100"></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              No Return Requests
            </h3>
            <p className="text-gray-600 text-lg">
              {returnsStatusFilter === "all"
                ? "No return requests have been submitted yet."
                : `No ${returnsStatusFilter} return requests found.`}
            </p>
          </div>
        </div>
      ) : (
        <>
          {returnRequests.map((returnRequest) => {
            const isExpanded = expandedReturns.has(returnRequest.id);

            return (
              <div
                key={returnRequest.id}
                className="group bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-gray-200/50 hover:shadow-2xl hover:border-blue-500/30 transition-all duration-500 transform hover:-translate-y-1 relative overflow-hidden p-6"
              >
                {/* Gradient overlay */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>

                {/* Header - Always Visible */}
                <div className="relative z-10 flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-900 rounded-2xl shadow-lg">
                      <FaUndo className="text-white text-lg" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                          Return Request #
                          {returnRequest.id.slice(-8).toUpperCase()}
                        </h4>
                        <span
                          className={`px-3 py-1 rounded-xl text-xs font-bold shadow-md ${getReturnStatusColor(returnRequest.status)}`}
                        >
                          {returnRequest.status.charAt(0).toUpperCase() +
                            returnRequest.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <FaUser className="text-xs" />
                          <span>
                            {returnRequest.userDetails?.username ||
                              "Unknown User"}
                          </span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <FaShoppingCart className="text-xs" />
                          <span>
                            Order #
                            {returnRequest.orderDetails?.orderNumber ||
                              returnRequest.orderId.slice(-6).toUpperCase()}
                          </span>
                        </span>
                        <span>•</span>
                        <span>
                          {getReasonDisplayText(returnRequest.reason)}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(
                            returnRequest.requestedAt,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleReturnExpansion(returnRequest.id)}
                    className={`p-3 rounded-xl font-bold shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 ${
                      isExpanded
                        ? "bg-gradient-to-r from-gray-500 to-gray-600 text-white"
                        : "bg-gradient-to-br from-blue-500 to-blue-900 text-white hover:from-blue-500 hover:to-blue-900"
                    }`}
                  >
                    <span className="text-sm">
                      {isExpanded ? "Collapse" : "Expand"}
                    </span>
                  </button>
                </div>

                {/* Expandable Details Section */}
                {isExpanded && (
                  <div className="mt-4 space-y-6 animate-fade-in-up">
                    {/* Return Items */}
                    <div className="relative z-10">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                          <FaBox className="text-white text-lg" />
                        </div>
                        <h5 className="text-lg font-bold text-gray-800">
                          Items to Return
                        </h5>
                        <div className="h-px bg-gradient-to-r from-gray-300 to-transparent flex-1"></div>
                        <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          {returnRequest.items.length} item
                          {returnRequest.items.length > 1 ? "s" : ""}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {returnRequest.items.map((item, itemIndex) => (
                          <div
                            key={itemIndex}
                            className="bg-gradient-to-br from-gray-50 to-gray-100/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 hover:border-blue-300 transition-all duration-300"
                          >
                            <div className="flex items-center space-x-4">
                              {item.image ? (
                                <div className="relative">
                                  <Image
                                    src={item.image}
                                    alt={item.name || "Product"}
                                    width={60}
                                    height={60}
                                    className="w-15 h-15 object-cover rounded-xl shadow-md"
                                  />
                                  <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                                    {item.quantity}
                                  </div>
                                </div>
                              ) : (
                                <div className="relative">
                                  <div className="w-15 h-15 bg-gradient-to-br from-gray-300 to-gray-400 rounded-xl shadow-md flex items-center justify-center">
                                    <FaBox className="text-gray-600 text-lg" />
                                  </div>
                                  <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                                    {item.quantity}
                                  </div>
                                </div>
                              )}

                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-900 truncate">
                                  {item.name ||
                                    `Product #${item.productId.slice(-6)}`}
                                </p>
                                <div className="flex items-center justify-between mt-1">
                                  <p className="text-sm text-gray-600">
                                    Qty: {item.quantity}
                                  </p>
                                  {item.price && (
                                    <p className="font-bold text-blue-600">
                                      रु
                                      {(item.price * item.quantity).toFixed(2)}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Return Details */}
                    <div className="relative z-10 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-2xl p-6 border border-gray-200/50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Request Information */}
                        <div className="space-y-3">
                          <h6 className="font-bold text-gray-800 flex items-center space-x-2">
                            <FaExclamationTriangle className="text-blue-500" />
                            <span>Return Details</span>
                          </h6>
                          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/30 space-y-2">
                            <p>
                              <strong>Reason:</strong>{" "}
                              {getReasonDisplayText(returnRequest.reason)}
                            </p>
                            {returnRequest.description && (
                              <p>
                                <strong>Description:</strong>{" "}
                                {returnRequest.description}
                              </p>
                            )}
                            <p>
                              <strong>Requested:</strong>{" "}
                              {new Date(
                                returnRequest.requestedAt,
                              ).toLocaleString()}
                            </p>
                            {returnRequest.processedAt && (
                              <p>
                                <strong>Processed:</strong>{" "}
                                {new Date(
                                  returnRequest.processedAt,
                                ).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Order Information */}
                        <div className="space-y-3">
                          <h6 className="font-bold text-gray-800 flex items-center space-x-2">
                            <FaShoppingCart className="text-blue-500" />
                            <span>Order Information</span>
                          </h6>
                          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/30 space-y-2">
                            <p>
                              <strong>Order:</strong> #
                              {returnRequest.orderDetails?.orderNumber ||
                                returnRequest.orderId.slice(-6).toUpperCase()}
                            </p>
                            <p>
                              <strong>Customer:</strong>{" "}
                              {returnRequest.orderDetails?.customer?.name}
                            </p>
                            <p>
                              <strong>Email:</strong>{" "}
                              {returnRequest.orderDetails?.customer?.email}
                            </p>
                            {returnRequest.orderDetails?.grandTotal && (
                              <p>
                                <strong>Order Total:</strong> रु
                                {returnRequest.orderDetails.grandTotal.toFixed(
                                  2,
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Images */}
                      {returnRequest.images &&
                        returnRequest.images.length > 0 && (
                          <div className="mb-6">
                            <h6 className="font-bold text-gray-800 mb-3">
                              Uploaded Images
                            </h6>
                            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                              {returnRequest.images.map((image, imgIndex) => (
                                <Image
                                  key={imgIndex}
                                  src={image}
                                  alt={`Return image ${imgIndex + 1}`}
                                  width={80}
                                  height={80}
                                  className="w-20 h-20 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow"
                                />
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Admin Note */}
                      {returnRequest.adminNote && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                          <h6 className="font-bold text-blue-800 mb-2">
                            Admin Note
                          </h6>
                          <p className="text-blue-700">
                            {returnRequest.adminNote}
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200/50">
                        {returnRequest.status === "pending" && (
                          <>
                            <button
                              onClick={() =>
                                updateReturnStatus(
                                  returnRequest.id,
                                  "approved",
                                  "Return request approved by admin",
                                )
                              }
                              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                            >
                              <FaCheck />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() =>
                                updateReturnStatus(
                                  returnRequest.id,
                                  "rejected",
                                  "Return request rejected by admin",
                                )
                              }
                              className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                            >
                              <FaTimes />
                              <span>Reject</span>
                            </button>
                          </>
                        )}
                        {returnRequest.status === "approved" && (
                          <button
                            onClick={() =>
                              updateReturnStatus(
                                returnRequest.id,
                                "completed",
                                "Return processed and completed",
                              )
                            }
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                          >
                            <FaCheck />
                            <span>Mark Completed</span>
                          </button>
                        )}
                        {(returnRequest.status === "completed" ||
                          returnRequest.status === "approved") && (
                          <button
                            onClick={() => {
                              const refundAmount = prompt(
                                "Enter refund amount (leave empty for full refund):",
                              );
                              const amount = refundAmount
                                ? parseFloat(refundAmount)
                                : returnRequest.orderDetails?.grandTotal;
                              updateReturnStatus(
                                returnRequest.id,
                                "refunded",
                                "Refund processed",
                                amount,
                              );
                            }}
                            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                          >
                            <span>💰</span>
                            <span>Process Refund</span>
                          </button>
                        )}
                        <button
                          onClick={() => deleteReturnRequest(returnRequest.id)}
                          className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:from-blue-500 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                        >
                          <FaTrash />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}

      {/* Pagination Controls */}
      {totalReturnsPages > 1 && (
        <div className="bg-gradient-to-r from-white via-blue-50/30 to-white backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-200/50 p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Pagination Info */}
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-500 rounded-2xl shadow-lg">
                <span className="text-white text-lg font-bold">#</span>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">
                  Page {currentReturnsPage} of {totalReturnsPages}
                </p>
                <p className="text-sm text-gray-600">
                  Showing {(currentReturnsPage - 1) * returnsPerPage + 1}-
                  {Math.min(currentReturnsPage * returnsPerPage, totalReturns)}{" "}
                  of {totalReturns} requests
                </p>
              </div>
            </div>

            {/* Pagination Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setCurrentReturnsPage(currentReturnsPage - 1)}
                disabled={currentReturnsPage === 1}
                className="group px-6 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl font-bold text-gray-700 hover:border-blue-500 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <span className="text-lg group-hover:-translate-x-1 transition-transform duration-300">
                  ←
                </span>
                <span>Previous</span>
              </button>

              {/* Page Numbers */}
              <div className="flex items-center space-x-2">
                {Array.from(
                  { length: Math.min(5, totalReturnsPages) },
                  (_, i) => {
                    let pageNum;
                    if (totalReturnsPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentReturnsPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentReturnsPage >= totalReturnsPages - 2) {
                      pageNum = totalReturnsPages - 4 + i;
                    } else {
                      pageNum = currentReturnsPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentReturnsPage(pageNum)}
                        className={`w-12 h-12 rounded-2xl font-bold transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl ${
                          currentReturnsPage === pageNum
                            ? "bg-gradient-to-br from-blue-500 to-red-500 text-white shadow-2xl scale-110"
                            : "bg-white/80 backdrop-blur-sm border-2 border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-500"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  },
                )}
              </div>

              <button
                onClick={() => setCurrentReturnsPage(currentReturnsPage + 1)}
                disabled={currentReturnsPage === totalReturnsPages}
                className="group px-6 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl font-bold text-gray-700 hover:border-blue-500 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <span>Next</span>
                <span className="text-lg group-hover:translate-x-1 transition-transform duration-300">
                  →
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
