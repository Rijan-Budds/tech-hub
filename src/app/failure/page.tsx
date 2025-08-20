import { XCircle } from "lucide-react";

// app/failure/page.tsx
export default function FailurePage() {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto" />
          <h1 className="mt-4 text-3xl font-bold">Payment Failed</h1>
          <p className="mt-2 text-gray-600">
            The transaction could not be completed. Please try again.
          </p>
        </div>
      </div>
    );
  }