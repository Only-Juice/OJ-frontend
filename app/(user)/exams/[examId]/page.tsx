"use client";

// next.js
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import useSWR from "swr";

// components
import Breadcrumbs from "@/components/Breadcrumbs";
import PaginationTable from "@/components/PaginationTable";

// utils
import { toSystemDateFormat } from "@/utils/datetimeUtils";
import { takeQuestion } from "@/utils/apiUtils";

// type
import type { ExamQuestion } from "@/types/api";

export default function Exam() {
  const router = useRouter();
  const params = useParams();
  const id = params.examId;

  const { data: examData } = useSWR(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/exams/${id}/exam`
  );

  const links = [
    { title: "Exams", href: "/exams" },
    { title: `${examData?.data?.exam_title}`, href: `/exams/${id}` },
  ];

  return (
    <div className="flex-1">
      <Breadcrumbs links={links}></Breadcrumbs>
      <div className="w-full flex justify-center gap-10 flex-1">
        <div className="flex-3 flex flex-col">
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
                <td>
                  {toSystemDateFormat(new Date(item.question.start_time))}
                </td>
                <td>{toSystemDateFormat(new Date(item.question.end_time))}</td>
                {/* <td>
                  {item.has_question ? (
                    <CircleCheck className="text-green-500" />
                  ) : (
                    <CircleX className="text-red-500" />
                  )}
                </td> */}
              </tr>
            )}
          />
        </div>
      </div>
    </div>
  );
}
