"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Profile() {
  const [data, setData] = useState(null);
  const [historyPage, setHistoryPage] = useState(1);
  const router = useRouter();

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const response = await fetch(
          `https://ojapi.ruien.me/api/score/all?page=${historyPage}`,
          {
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch scores");
        }

        const data = await response.json();
        setData(data.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchScores();
  }, [historyPage]);

  return (
    <Navbar links={[{ title: "Dashboard", href: "/dashboard" }]}>
      <div className="w-full flex justify-center gap-10 flex-1">
        <div className="card flex-1 flex flex-col gap-10 items-center bg-base-100">
          <div className="card-body w-full flex flex-col">
            <h2 className="card-title">Sunmit history</h2>
            <ul className="list">
              {data?.scores.map((score, index) => {
                return (
                  <li
                    key={index}
                    className="list-row cursor-pointer"
                    onClick={() => {
                      router.push(`/problem/${score.question_id}`);
                    }}
                  >
                    <p>{score.question_id}</p>
                    <p>{new Date(score.judge_time).toLocaleString()}</p>
                    <p>{score.score}</p>
                  </li>
                );
              })}
            </ul>
            <div className="flex-1"></div>
            <div className="join justify-center mt-10">
              <button
                className="join-item btn"
                onClick={() => {
                  if (historyPage > 1) {
                    setHistoryPage(historyPage - 1);
                  }
                }}
              >
                «
              </button>
              <button className="join-item btn">Page {historyPage}</button>
              <button
                className="join-item btn"
                onClick={() => {
                  if (data?.scores_count > historyPage * 10) {
                    setHistoryPage(historyPage + 1);
                  }
                }}
              >
                »
              </button>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-10">
          <div className="flex-1 flex gap-10">
            <div className="card flex-1 bg-base-200">
              <div className="card-body">
                <div className="grid grid-cols-12 gap-4">
                  {Array.from({ length: 20 }).map((_, index) => {
                    const colors = ["#1CBABA", "#FFB700", "#F63737"];
                    const randomColor =
                      colors[Math.floor(Math.random() * colors.length)];
                    return (
                      <div
                        key={index}
                        className="w-full aspect-square rounded"
                        style={{ backgroundColor: randomColor }}
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
    </Navbar>
  );
}
