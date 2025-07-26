"use client";

// next.js
import useSWR from "swr";
import Link from "next/link";

// components
import Breadcrumbs from "@/components/Breadcrumbs";

// utils
import { toSystemDateFormat } from "@/utils/datetimeUtils";

export default function Exam() {
  const links = [{ title: "Contests", href: "/contest" }];

  const { data: examsData } = useSWR("https://ojapi.ruien.me/api/exams");

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumbs links={links} />
      <div className="flex flex-1 flex-wrap gap-8">
        {examsData?.data?.map((exam) => (
          <div className="card bg-base-100 w-96 h-50 shadow-sm" key={exam.id}>
            <figure>
              {/* <img
                src={exam.image || "https://imgur.com/M8ORacF.png"}
                style={{ height: "200px", objectFit: "cover", width: "100%" }}
              /> */}
            </figure>
            <div className="card-body">
              <h2 className="card-title">{exam.title}</h2>
              <p>Start from: {toSystemDateFormat(new Date(exam.start_time))}</p>
              <p>End at: {toSystemDateFormat(new Date(exam.end_time))}</p>
              <div className="card-actions justify-end">
                <Link href={`/contest/${exam.id}`}>
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
