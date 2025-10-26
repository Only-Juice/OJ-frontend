"use client";

// next.js
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";

// components
import PaginationTable from "@/components/PaginationTable";

// utils
import { toSystemDateFormat } from "@/utils/datetimeUtils";
import { takeQuestion } from "@/utils/fetchUtils";

// type
import type { ExamQuestion } from "@/types/api/common";

// icon
import { Trophy, CircleCheck, CircleX } from "lucide-react";

// export default function Exam() {
//   const router = useRouter();
//   const params = useParams();
//   const id = params.examId;
//   return (
//     <div className="flex-1 flex flex-col">
//       <div className="flex justify-end items-center">
//         <Link href={`/exams/${id}/rank`}>
//           <button className="btn btn-primary">
//             <Trophy />
//             Rank
//           </button>
//         </Link>
//       </div>
//       <PaginationTable<ExamQuestion>
//         classname="table-lg"
//         url={`${process.env.NEXT_PUBLIC_API_BASE_URL}/exams/${id}/questions`}
//         totalField="question_count"
//         dataField="questions"
//         theadShow={() => (
//           <tr>
//             <th>Question Title</th>
//             <th>Start Date</th>
//             <th>End Date</th>
//             <th>Status</th>
//           </tr>
//         )}
//         tbodyShow={(item, index) => (
//           <tr
//             key={index}
//             className="cursor-pointer hover:bg-base-200"
//             onClick={async () => {
//               if (!item.has_question) {
//                 await takeQuestion(item.question.id);
//               }
//               router.push(`/exams/${id}/questions/${item.question.id}`);
//             }}
//           >
//             <td>{item.question.title}</td>
//             <td>{toSystemDateFormat(new Date(item.question.start_time))}</td>
//             <td>{toSystemDateFormat(new Date(item.question.end_time))}</td>
//             <td>
//               {item.top_score >= 100 ? (
//                 <CircleCheck className="text-green-500" />
//               ) : (
//                 <CircleX className="text-red-500" />
//               )}
//             </td>
//           </tr>
//         )}
//       />
//     </div>
//   );
// }

export default function Exam() {
  const params = useParams();
  const id = params.examId;

  const router = useRouter();
  const [status, setStatus] = useState("all"); // 初始值

  return (
    <div className="flex flex-1 flex-col max-h-full">
      <div className="flex justify-end mb-4">
        <QuestionStatusDropDown value={status} onChange={setStatus} />
      </div>
      <PaginationTable<ExamQuestion>
        classname="table-lg"
        url={`${process.env.NEXT_PUBLIC_API_BASE_URL}/exams/${id}/questions`}
        totalField="question_count"
        dataField="questions"
        theadShow={() => (
          <tr>
            <th>Question Title</th>
            <th>Point</th>
            <th>Status</th>
            <th>Availability</th>
          </tr>
        )}
        tbodyShow={(item, index) => {
          const isDisabled = new Date(item.question.end_time) < new Date();
          return (
            <tr
              key={index}
              className={`
                    ${
                      isDisabled
                        ? "cursor-pointer opacity-50"
                        : "cursor-pointer hover:bg-base-200"
                    }`}
              onClick={async () => {
                if (!item.has_question) {
                  await takeQuestion(item.question.id);
                }
                router.push(`/exams/${id}/questions/${item.question.id}`);
              }}
            >
              <td>{item.question.title}</td>
              <td>{item.point}</td>
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

function QuestionStatusDropDown({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <select
      value={value}
      className="select"
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="all">All</option>
      <option value="active">Active</option>
      <option value="expired">Expired</option>
    </select>
  );
}
