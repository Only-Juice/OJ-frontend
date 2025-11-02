"use client";

// next.js
import { useParams } from "next/navigation";
import useSWR from "swr";

// components
import Leaderboard from "@/components/Leaderboard";

// type
import type { ExamQuestion, Question } from "@/types/api/common";

export default function ExamRankPage() {
  const params = useParams();
  const id = params.examId;

  const { data: questionsData } = useSWR(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/exams/${id}/questions?limit=${
      2 ** 31 - 1
    }`
  );
  const questions = questionsData?.data?.questions ?? [];

  const leaderboardUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/exams/${id}/leaderboard`;

  return (
    <div className="flex-1 flex flex-col">
      <Leaderboard
        questions={getQuestion(questions)}
        leaderboardUrl={leaderboardUrl}
      />
    </div>
  );
}

function getQuestion(questions: ExamQuestion[]) {
  const sortedQuestions =
    questions
      ?.map((question: ExamQuestion) => question.question)
      ?.slice()
      .sort((a: Question, b: Question) => a.id - b.id) ?? [];

  return sortedQuestions;
}
