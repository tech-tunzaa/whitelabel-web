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
    <div className="flex justify-end items-center my-6 gap-4 select-none w-full">
      <Button
        variant="outline"
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-md shadow-sm transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-primary/10 focus:ring-2 focus:ring-primary/30"
        aria-label="Previous page"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Previous
      </Button>
      <span className="text-gray-500 text-base font-medium mx-2">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        variant="outline"
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="px-4 py-2 rounded-md shadow-sm transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-primary/10 focus:ring-2 focus:ring-primary/30"
        aria-label="Next page"
      >
        Next <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
};

export default Pagination;
