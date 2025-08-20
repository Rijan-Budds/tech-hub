import { CheckCircle } from "lucide-react";

// app/success/page.tsx
export default function SuccessPage() {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <h1 className="mt-4 text-3xl font-bold">Payment Successful!</h1>
          <p className="mt-2 text-gray-600">
            Thank you for your Payment. Your transaction has been completed successfully.
          </p>
        </div>
      </div>
    );
  }