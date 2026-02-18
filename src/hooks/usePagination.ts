import { useState, useMemo, useEffect } from 'react';

interface UsePaginationResult {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  startIndex: number;
  endIndex: number;
}

export function usePagination(
  totalItems: number,
  pageSize: number,
  deps: any[] = []
): UsePaginationResult {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  // Clamp page if items shrink
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const { startIndex, endIndex } = useMemo(() => ({
    startIndex: (currentPage - 1) * pageSize,
    endIndex: Math.min(currentPage * pageSize, totalItems),
  }), [currentPage, pageSize, totalItems]);

  return { currentPage, setCurrentPage, totalPages, startIndex, endIndex };
}
