"use client";

import Navbar from "@/components/Navbar";
import ProblemsTable from "@/components/ProblemsTable";
import { useEffect, useState } from "react";

export default function Problem() {
  const formatNumber = (num: number) => String(num).padStart(2, "0");
  const [questions, setQuestions] = useState([]);
  useEffect(() => {
    fetch("https://ojapi.ruien.me/api/question", {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        const extractedQuestions = (data.data?.questions || []).map(
          (question: any, index: number) => {
            const day = formatNumber(index + 1);
            return {
              id: question.id,
              title: question.title,
              startTime: question.start_time,
              endTime: question.end_time,
              status: false,
            };
          }
        );
        setQuestions(extractedQuestions);
      })
      .catch((error) => console.error("Error fetching questions:", error));
  }, []);
  return (
    <Navbar links={[{ title: "Problems", href: "/problem" }]}>
      <div className="w-full flex justify-center gap-10 flex-1">
        <div className="flex-3">
          <ProblemsTable data={questions}></ProblemsTable>
        </div>
        <div className="flex-1">
          <div className="card card-dash bg-base-100">
            <div className="card-body flex justify-center items-center">
              <div
                className="radial-progress bg-primary text-primary-content border-primary border-4"
                style={
                  {
                    "--value": "70",
                    "--size": "12rem",
                    "--thickness": "2rem",
                  } /* as React.CSSProperties */
                }
                aria-valuenow={70}
                role="progressbar"
              >
                70%
              </div>
              <div className="h-10"></div>
              <p className="text-3xl">Point 600</p>
            </div>
          </div>
        </div>
      </div>
    </Navbar>
  );
}
