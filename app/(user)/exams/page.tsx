"use client";

// next.js
import useSWR from "swr";
import Link from "next/link";

// utils
import { toSystemDateFormat } from "@/utils/datetimeUtils";

// types
import type { Exam } from "@/types/api/common";

export default function Exam() {
  const { data: examsData } = useSWR(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/exams`
  );

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-wrap gap-8">
        {examsData?.data?.map((exam: Exam) => (
          <div className="card bg-base-100 w-96 shadow-sm" key={exam.id}>
            <div className="card-body">
              <h2 className="card-title">{exam.title}</h2>
              <div className="grid grid-rows-2 grid-cols-[auto_1fr]">
                <div>Start from</div>
                <div>：{toSystemDateFormat(new Date(exam.start_time))}</div>
                <div>End at</div>
                <div>：{toSystemDateFormat(new Date(exam.end_time))}</div>
              </div>
              <div className="card-actions justify-end">
                <Link href={`/exams/${exam.id}`}>
                  <button className="btn btn-primary">Join</button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
