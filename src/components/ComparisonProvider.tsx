"use client";

import React from "react";
import ProductSelector from "./ProductSelector";
import ProductComparisonModal from "./ProductComparisonModal";
import CompareIndicator from "./CompareIndicator";

export default function ComparisonProvider() {
  return (
    <>
      <ProductSelector />
      <ProductComparisonModal />
      <CompareIndicator />
    </>
  );
}
