"use client";

// react
import { JSX } from "react";
import { useState, useEffect } from "react";

// next.js
import useSWR from "swr";

interface PaginationTableProps<T> {
  classname?: string;
  url: string;
  limit: number;
  totalField: string;
  dataField: string;
  theadShow: () => JSX.Element;
  tbodyShow: (
    item: T,
    rowIndex: number,
    total: number,
    page: number
  ) => JSX.Element;
  onPageChange?: (page: number) => void;
  onDataLoaded?: (data: T[]) => void;
}

export default function PaginationTable<T>({
  classname = "",
  url,
  limit,
  totalField,
  dataField,
  theadShow,
  tbodyShow,
  onPageChange,
  onDataLoaded,
}: PaginationTableProps<T>) {
  const [page, setPage] = useState(1);

  const { data } = useSWR(`${url}?page=${page}&limit=${limit}`);

  const items: T[] = data?.data?.[dataField] || [];

  const totalCount = data?.data?.[totalField] || 0;

  const subtractPage = () => {
    if (page <= 1) return;
    setPage((prev) => prev - 1);
  };

  const addPage = () => {
    if (totalCount <= page * limit) return;
    setPage((prev) => prev + 1);
  };

  useEffect(() => {
    if (onPageChange) {
      onPageChange(page);
    }
  }, [page]);

  useEffect(() => {
    if (onDataLoaded) {
      onDataLoaded(items);
    }
  }, [items]);

  return (
    <>
      <div className="overflow-y-auto flex-1">
        <table className={`table ${classname}`}>
          <thead>{theadShow()}</thead>
          <tbody>
            {items.map((item, index) =>
              tbodyShow(item, index, totalCount, page)
            )}
          </tbody>
        </table>
      </div>

      <div className="join items-center justify-center mt-4">
        <button className="join-item btn" onClick={subtractPage}>
          «
        </button>
        <button className="join-item btn">Page {page}</button>
        <button className="join-item btn" onClick={addPage}>
          »
        </button>
      </div>
    </>
  );
}
