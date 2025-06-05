import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, pageSize, totalItems, onPageChange }) => {
  const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);


  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex justify-end items-center my-4 space-x-2">
      <Button
        variant="outline"
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="font-semibold px-4 py-2 rounded disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        <ArrowLeft />Previous
      </Button>
      <span className="text-gray-700 font-medium">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        variant="outline"
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="font-semibold px-4 py-2 rounded disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        Next <ArrowRight />
      </Button>
    </div>
  );
};

export default Pagination;
