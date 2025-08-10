"use client";

// next.js
import { useRouter } from "next/navigation";

// components
import Breadcrumbs from "@/components/Breadcrumbs";
import PaginationTable from "@/components/PaginationTable";

// type
import type { SubmitResultOnDashboard } from "@/types/api";

// utils
import { toSystemDateFormat } from "@/utils/datetimeUtils";

export default function Dashboard() {
  const links = [{ title: "Dashboard", href: "/dashboard" }];

  const router = useRouter();

  return (
    <div className="flex flex-col flex-1">
      <Breadcrumbs links={links}></Breadcrumbs>
      <div className="w-full flex justify-center gap-10 flex-1">
        <div className="card flex-1 flex flex-col gap-10 items-center bg-base-100">
          <div className="card-body w-full flex flex-col">
            <h2 className="card-title">Submit history</h2>
            <PaginationTable<SubmitResultOnDashboard>
              url={`${process.env.NEXT_PUBLIC_API_BASE_URL}/score/all`}
              limit={10}
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
      </div>
    </div>
  );
}
