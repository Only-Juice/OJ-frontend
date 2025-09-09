"use client";

// react
import { JSX } from "react";
import { useState, useEffect } from "react";

// next.js
import useSWR from "swr";

interface PaginationTableProps<T> {
  classname?: string;
  url: string;
  limit?: number;
  totalField: string;
  dataField: string;
  theadShow: () => JSX.Element;
  tbodyShow: (
    item: T,
    index: number,
    seqNo: number,
    descSeqNo: number
  ) => JSX.Element;
  onPageChange?: (page: number) => void;
  onDataLoaded?: (data: T[]) => void;
}

export default function PaginationTable<T>({
  classname = "",
  url,
  limit = 10,
  totalField,
  dataField,
  theadShow,
  tbodyShow,
  onPageChange,
  onDataLoaded,
}: PaginationTableProps<T>) {
  const [page, setPage] = useState(1);

  const urlObj = new URL(url);
  urlObj.searchParams.set("limit", limit.toString());
  urlObj.searchParams.set("page", page.toString());

  const { data, isLoading } = useSWR(urlObj.toString());

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
            {items.map((item, index) => {
              const seqNo = (page - 1) * limit + index + 1;
              const descSeqNo = totalCount - seqNo + 1;
              return tbodyShow(item, index, seqNo, descSeqNo);
            })}
          </tbody>
        </table>
      </div>

      <div className="text-right flex items-center justify-end gap-2 mt-4">
        {isLoading && <span className="loading loading-spinner"></span>}
        {Math.min((page - 1) * limit + 1, totalCount)}-
        {Math.min(page * limit, totalCount)} of {totalCount}
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
