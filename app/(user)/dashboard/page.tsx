"use client";

// next.js
import { useRouter } from "next/navigation";

// components
import PaginationTable from "@/components/PaginationTable";

// type
import type { SubmitResultOnDashboard } from "@/types/api/common";

// utils
import { toSystemDateFormat } from "@/utils/datetimeUtils";

export default function Dashboard() {
  const router = useRouter();

  return (
    <div className="card bg-base-100 flex flex-1">
      <div className="card-body flex flex-1 flex-col max-h-full">
        <h2 className="card-title">Submit history</h2>
        <PaginationTable<SubmitResultOnDashboard>
          url={`${process.env.NEXT_PUBLIC_API_BASE_URL}/score/all`}
          totalField="scores_count"
          dataField="scores"
          theadShow={() => (
            <tr>
              <th>#</th>
              <th>Question Title</th>
              <th>Time</th>
              <th>Score</th>
            </tr>
          )}
          tbodyShow={(item, index, total, page) => (
            <tr
              key={index}
              className="cursor-pointer hover:bg-base-200"
              onClick={() => {
                router.push(`/questions/${item.question_id}`);
              }}
            >
              <td>{total - index - (page - 1) * 10}</td>
              <td>{item.question_title}</td>
              <td>{toSystemDateFormat(new Date(item.judge_time))}</td>
              <td>{item.score >= 0 ? item.score : item.message}</td>
            </tr>
          )}
        />
      </div>
    </div>
  );
}
