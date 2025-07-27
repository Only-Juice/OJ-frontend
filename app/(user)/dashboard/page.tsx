"use client";

// next.js
import { useRouter } from "next/navigation";

// components
import Breadcrumbs from "@/components/Breadcrumbs";
import SubmitHistoryTable from "@/components/SubmitHistoryTable";
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
            <SubmitHistoryTable
              url={`${process.env.NEXT_PUBLIC_API_BASE_URL}/score/all`}
              limit={10}
              enableHightlight={false}
              theadShow={() => (
                <>
                  <th>#</th>
                  <th>Question ID</th>
                  <th>Time</th>
                  <th>Score</th>
                </>
              )}
              tbodyShow={(item) => (
                <>
                  <td>{item.question_id}</td>
                  <td>{toSystemDateFormat(new Date(item.judge_time))}</td>
                  <td>{item.score >= 0 ? item.score : item.message}</td>
                </>
              )}
              onRowClick={(item, callByClickRow) => {
                if (callByClickRow) {
                  router.push(`/questions/${item.question_id}`);
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
