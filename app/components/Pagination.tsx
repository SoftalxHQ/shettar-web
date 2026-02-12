'use client';

import { useState } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = [];

  // Generate page numbers
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
  }

  return (
    <nav className="flex justify-center mt-8" aria-label="Pagination">
      <ul className="inline-flex items-center gap-1 rounded-lg bg-white dark:bg-zinc-900 p-1 shadow-md">
        {/* Previous Button */}
        <li>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </li>

        {/* Page Numbers */}
        {pages.map((page, index) => (
          <li key={index}>
            {page === '...' ? (
              <span className="flex items-center justify-center w-10 h-10 text-gray-500">
                ...
              </span>
            ) : (
              <button
                onClick={() => onPageChange(page as number)}
                className={`flex items-center justify-center w-10 h-10 rounded-md font-medium transition-colors ${currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-300'
                  }`}
                aria-label={`Page ${page}`}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </button>
            )}
          </li>
        ))}

        {/* Next Button */}
        <li>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </li>
      </ul>
    </nav>
  );
}
