"use client";

// next.js
import { useRouter } from "next/navigation";
import useSWR from "swr";

// components
import Breadcrumbs from "@/components/Breadcrumbs";

// utils
import { toSystemDateFormat } from "@/utils/datetimeUtils";

export default function Dashboard() {
  const links = [{ title: "Dashboard", href: "/dashboard" }];

  const { data } = useSWR(`${process.env.NEXT_PUBLIC_API_BASE_URL}/score/all`);

  const history = data?.data;

  const router = useRouter();

  return (
    <div className="flex flex-col flex-1">
      <Breadcrumbs links={links}></Breadcrumbs>
      <div className="w-full flex justify-center gap-10 flex-1">
        <div className="card flex-1 flex flex-col gap-10 items-center bg-base-100">
          <div className="card-body w-full flex flex-col">
            <h2 className="card-title">Submit history</h2>
            <div className="overflow-y-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Question ID</th>
                    <th>Time</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {history?.scores.map((score: any, index: number) => {
                    return (
                      <tr
                        key={index}
                        className="list-row cursor-pointer"
                        onClick={() => {
                          router.push(`/questions/${score.question_id}`);
                        }}
                      >
                        <td>{score.question_id}</td>
                        <td>
                          {toSystemDateFormat(new Date(score.judge_time))}
                        </td>
                        <td>{score.score}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
