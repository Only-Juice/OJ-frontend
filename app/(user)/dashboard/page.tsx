"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import useSWR from "swr";

const fakeData = Array.from({ length: 20 }, () => {
  const colors = ["#1CBABA", "#FFB700", "#F63737"];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  return randomColor;
});

export default function Profile() {
  const links = [{ title: "Dashboard", href: "/dashboard" }];

  const [historyPage, setHistoryPage] = useState(1);

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
                  {history?.scores.map((score, index) => {
                    return (
                      <tr
                        key={index}
                        className="list-row cursor-pointer"
                        onClick={() => {
                          router.push(`/problem/${score.question_id}`);
                        }}
                      >
                        <td>{score.question_id}</td>
                        <td>{new Date(score.judge_time).toLocaleString()}</td>
                        <td>{score.score}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-10">
          <div className="flex-1 flex gap-10">
            <div className="card flex-1 bg-base-200">
              <div className="card-body">
                <div className="grid grid-cols-12 gap-4">
                  {fakeData.map((color, index) => {
                    return (
                      <div
                        key={index}
                        className="w-full aspect-square rounded"
                        style={{ backgroundColor: color }}
                      ></div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          <div className="card flex-1 flex flex-col gap-10 items-center bg-base-100"></div>
        </div>
      </div>
    </div>
  );
}
