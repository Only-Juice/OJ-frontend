"use client";

// next.js
import useSWR from "swr";

// components
import Breadcrumbs from "@/components/Breadcrumbs";

// type
import type { Question } from "@/types/api";
import Leaderboard from "@/components/Leaderboard";

export default function RankPage() {
  const links = [{ title: "Rank", href: "/rank" }];

  const leaderboardUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/score/leaderboard`;

  const { data: questionsData } = useSWR(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/questions?limit=${2 ** 31 - 1}`
  );
  const questions = questionsData?.data?.questions ?? [];

  return (
    <div className="flex-1 flex flex-col">
      <Breadcrumbs links={links}></Breadcrumbs>
      <Leaderboard
        questions={getQuestion(questions)}
        leaderboardUrl={leaderboardUrl}
      />
    </div>
  );
}

function getQuestion(questions: Question[]) {
  const sortedQuestions =
    questions?.slice().sort((a: Question, b: Question) => a.id - b.id) ?? [];

  return sortedQuestions;
}
