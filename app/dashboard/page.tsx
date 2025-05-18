"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Profile() {
  const [scores, setScores] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const response = await fetch("https://ojapi.ruien.me/api/score/all", {
          headers: {
            accept: "application/json",
            Authorization:
              "***REMOVED***",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch scores");
        }

        const data = await response.json();
        setScores(data.data.scores);
      } catch (error) {
        console.error(error);
      }
    };

    fetchScores();
  }, []);

  return (
    <Navbar links={[{ title: "Dashboard", href: "/dashboard" }]}>
      <div className="w-full flex justify-center gap-10 flex-1">
        <div className="card flex-1 flex flex-col gap-10 items-center bg-base-100">
          <div className="card-body w-full">
            <h2 className="card-title">Sunmit history</h2>
            <ul className="list">
              {scores.map((score, index) => {
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
