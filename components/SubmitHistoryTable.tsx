"use client";

// react
import { JSX } from "react";
import { useState, useEffect } from "react";

// next.js
import useSWR from "swr";

// 類型定義
export type SubmitResult = {
  question_id: number;
  git_user_repo_url: string;
  score: number;
  message: string;
  judge_time: string;
};

// props 結構
interface SubmitHistoryTableProps {
  url: string;
  limit: number;
  enableHightlight: boolean;
  theadShow: () => JSX.Element;
  tbodyShow: (item: SubmitResult) => JSX.Element;
  // 換頁時會觸發 onRowClick
  // 如果 callByClickRow 為 true，則表示是點擊 row 觸發
  onRowClick: (item: SubmitResult, callByClickRow: boolean) => void;
}

// 元件定義
export default function SubmitHistoryTable({
  url,
  limit,
  enableHightlight,
  theadShow,
  tbodyShow,
  onRowClick,
}: SubmitHistoryTableProps) {
  const [page, setPage] = useState(1);

  const [selectIndex, setSelectIndex] = useState(0);
  const [isPageChanging, setIsPageChanging] = useState(false);

  const { data: response } = useSWR(`${url}?page=${page}&limit=${limit}`);
  const scores: SubmitResult[] = response?.data.scores || [];

  const subtractPage = () => {
    if (page <= 1) return;
    setPage((prev) => prev - 1);
    setIsPageChanging(true);
  };

  const addPage = () => {
    if (response.data.scores_count <= page * limit) return;
    setPage((prev) => prev + 1);
    setIsPageChanging(true);
  };

  useEffect(() => {
    if (!isPageChanging || scores.length === 0) return;

    setSelectIndex(0);
    onRowClick(scores[0], false);
    setIsPageChanging(false); // 重設 flag，避免重複觸發
  }, [scores]);

  return (
    <>
      <div className="overflow-y-auto flex-1">
        <table className="table">
          <thead>
            <tr>{theadShow()}</tr>
          </thead>
          <tbody>
            {scores.map((item, index) => (
              <tr
                key={index}
                className={`cursor-pointer ${
                  enableHightlight && selectIndex === index
                    ? "bg-primary text-primary-content"
                    : "hover:bg-base-200"
                }`}
                onClick={() => {
                  setSelectIndex(index);
                  onRowClick(item, true);
                }}
              >
                <td>
                  {response.data.scores_count - (page - 1) * limit - index}
                </td>
                {tbodyShow(item)}
              </tr>
            ))}
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
