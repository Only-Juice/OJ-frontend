"use client";

// next.js
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import useSWR from "swr";

// components
import Breadcrumbs from "@/components/Breadcrumbs";
import ProblemsTable from "@/components/UserQuestionsTable";

export default function Exam() {
  const router = useRouter();
  const params = useParams();
  const id = params.examId;

  const { data: questionData } = useSWR(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/exams/${id}/questions`
  );

  const links = [
    { title: "Exams", href: "/exams" },
    { title: `Exam ${id}`, href: `/exams/${id}` },
  ];

  const examQuestions =
    (questionData?.data || []).map((question: any) => {
      return {
        id: question.id,
        title: question.title,
        startTime: question.start_time,
        endTime: question.end_time,
        status: false,
        has_question: false,
        onClick: async () => {
          router.push(`/exams/${id}/questions/${question.id}`);
        },
      };
    }) || [];

  return (
    <div className="flex-1">
      <Breadcrumbs links={links}></Breadcrumbs>
      <div className="w-full flex justify-center gap-10 flex-1">
        <div className="flex-3">
          <ProblemsTable data={examQuestions}></ProblemsTable>
        </div>
      </div>
    </div>
  );
}
