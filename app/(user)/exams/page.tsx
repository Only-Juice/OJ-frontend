"use client";

// next.js
import useSWR from "swr";
import Link from "next/link";

// components
import Breadcrumbs from "@/components/Breadcrumbs";

// utils
import { toSystemDateFormat } from "@/utils/datetimeUtils";

// types
import type { Exam } from "@/types/api";

export default function Exam() {
  const links = [{ title: "Exams", href: "/exams" }];

  const { data: examsData } = useSWR(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/exams`
  );

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumbs links={links} />
      <div className="flex flex-wrap gap-8">
        {examsData?.data?.map((exam: Exam) => (
          <div className="card bg-base-100 w-96 shadow-sm" key={exam.id}>
            <div className="card-body">
              <h2 className="card-title">{exam.title}</h2>
              <tbody>
                <tr>
                  <td>Start from</td>
                  <td>：{toSystemDateFormat(new Date(exam.start_time))}</td>
                </tr>
                <tr>
                  <td>End at</td>
                  <td>：{toSystemDateFormat(new Date(exam.end_time))}</td>
                </tr>
              </tbody>
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
