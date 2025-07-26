"use client";

// next.js
import { useRouter } from "next/navigation";
import useSWR from "swr";

// components
import Breadcrumbs from "@/components/Breadcrumbs";
import QuestionsTable from "@/components/UserQuestionsTable";

export default function Problem() {
  const router = useRouter();
  const links = [{ title: "Questions", href: "/questions" }];

  const { data: questionData } = useSWR(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/questions`
  );

  const questions =
    (questionData?.data?.questions || []).map((question: any) => {
      return {
        id: question.id,
        title: question.title,
        startTime: question.start_time,
        endTime: question.end_time,
        has_question: question.has_question,
        top_score: question.top_score,
        onClick: async () => {
          router.push(`/questions/${question.id}`);
        },
      };
    }) || [];

  return (
    <div className="flex-1">
      <Breadcrumbs links={links}></Breadcrumbs>
      <div className="w-full flex justify-center gap-10 flex-1">
        <div className="flex-3">
          <QuestionsTable data={questions}></QuestionsTable>
        </div>
      </div>
    </div>
  );
}
