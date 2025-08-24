"use client";

// next.js
import { useRouter } from "next/navigation";

// components
import Breadcrumbs from "@/components/Breadcrumbs";
import PaginationTable from "@/components/PaginationTable";

// type
import type { Question } from "@/types/api";

// utils
import { toSystemDateFormat } from "@/utils/datetimeUtils";
import { takeQuestion } from "@/utils/apiUtils";

// icon
import { CircleCheck, CircleX } from "lucide-react";

export default function Problem() {
  const router = useRouter();
  const links = [{ title: "Questions", href: "/questions" }];

  return (
    <div className="flex-1 flex flex-col">
      <Breadcrumbs links={links}></Breadcrumbs>
      <PaginationTable<Question>
        classname="table-lg"
        url={`${process.env.NEXT_PUBLIC_API_BASE_URL}/questions`}
        totalField="question_count"
        dataField="questions"
        theadShow={() => (
          <tr>
            <th>Question Title</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
            <th>Availability</th>
          </tr>
        )}
        tbodyShow={(item, index) => {
          const isDisabled = new Date(item.end_time) < new Date();
          return (
            <tr
              key={index}
              className={`
                    ${
                      isDisabled
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer hover:bg-base-200"
                    }`}
              onClick={async () => {
                if (isDisabled) return;
                if (!item.has_question) {
                  await takeQuestion(item.id);
                }
                router.push(`/questions/${item.id}`);
              }}
            >
              <td>{item.title}</td>
              <td>{toSystemDateFormat(new Date(item.start_time))}</td>
              <td>{toSystemDateFormat(new Date(item.end_time))}</td>
              <td>
                {item.top_score >= 100 ? (
                  <CircleCheck className="text-green-500" />
                ) : (
                  <CircleX className="text-red-500" />
                )}
              </td>
              {isDisabled ? (
                <td className="text-red-500 flex items-center gap-2">
                  <CircleX />
                  Expired
                </td>
              ) : (
                <td className="text-green-500 flex items-center gap-2">
                  <CircleCheck />
                  Active
                </td>
              )}
            </tr>
          );
        }}
      />
    </div>
  );
}
