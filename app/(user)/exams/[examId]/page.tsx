"use client";

// next.js
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import useSWR from "swr";

// components
import PaginationTable from "@/components/PaginationTable";

// utils
import { toSystemDateFormat } from "@/utils/datetimeUtils";
import { takeQuestion } from "@/utils/fetchUtils";

// type
import type { ExamQuestion } from "@/types/api/common";

// icon
import { Trophy, CircleCheck, CircleX } from "lucide-react";

export default function Exam() {
  const router = useRouter();
  const params = useParams();
  const id = params.examId;

  const { data: examData } = useSWR(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/exams/${id}/exam`
  );

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex justify-end items-center">
        <Link href={`/exams/${id}/rank`}>
          <button className="btn btn-primary">
            <Trophy />
            Rank
          </button>
        </Link>
      </div>
      <PaginationTable<ExamQuestion>
        classname="table-lg"
        url={`${process.env.NEXT_PUBLIC_API_BASE_URL}/exams/${id}/questions`}
        limit={15}
        totalField="question_count"
        dataField="questions"
        theadShow={() => (
          <tr>
            <th>Question Title</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
          </tr>
        )}
        tbodyShow={(item, index) => (
          <tr
            key={index}
            className="cursor-pointer hover:bg-base-200"
            onClick={async () => {
              if (!item.has_question) {
                await takeQuestion(item.question.id);
              }
              router.push(`/exams/${id}/questions/${item.question.id}`);
            }}
          >
            <td>{item.question.title}</td>
            <td>{toSystemDateFormat(new Date(item.question.start_time))}</td>
            <td>{toSystemDateFormat(new Date(item.question.end_time))}</td>
            <td>
              {item.top_score >= 100 ? (
                <CircleCheck className="text-green-500" />
              ) : (
                <CircleX className="text-red-500" />
              )}
            </td>
          </tr>
        )}
      />
    </div>
  );
}
