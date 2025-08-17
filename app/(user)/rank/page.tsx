"use client";

// next.js
import useSWR from "swr";

// components
import Breadcrumbs from "@/components/Breadcrumbs";
import PaginationTable from "@/components/PaginationTable";

// icon
import { Award } from "lucide-react";

// type
import type { Question, Rank } from "@/types/api";

export default function Rank() {
  const links = [{ title: "Rank", href: "/rank" }];

  const { data: questionData } = useSWR(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/questions?limit=${2 ** 31 - 1}`
  );
  const questions =
    questionData?.data?.questions
      ?.slice()
      .sort((a: Question, b: Question) => a.id - b.id) ?? [];

  return (
    <div className="flex-1">
      <Breadcrumbs links={links}></Breadcrumbs>
      <div className="w-full flex justify-center gap-10 card flex-1">
        <div className="card-body w-full">
          <PaginationTable<Rank>
            classname="table-pin-rows table-pin-cols border-separate border-spacing-2"
            url={`${process.env.NEXT_PUBLIC_API_BASE_URL}/score/leaderboard`}
            limit={15}
            totalField="count"
            dataField="scores"
            theadShow={() => (
              <tr>
                <th className="text-center">#</th>
                <th>Username</th>
                {generateQuestionColumns(questions)}
                <th>Total Score</th>
              </tr>
            )}
            tbodyShow={(item, index, total, page) => (
              <tr key={index}>
                {generateRankColumns(index, total, page)}
                <th>{item.user_name}</th>
                {questions.map((question: Question) => {
                  const score = item.question_scores.find(
                    (q) => q.question_id === question.id
                  );
                  return (
                    <GradientTd
                      value={score ? score.score : 0}
                      key={question.id}
                    />
                  );
                })}
                <th className="text-center">{item.total_score}</th>
              </tr>
            )}
          />
        </div>
      </div>
    </div>
  );
}

function generateRankColumns(index: number, total: number, page: number) {
  const rank = index + 1 + (page - 1) * total;
  if (rank === 1) {
    return (
      <th className="flex justify-center">
        <Award color="gold" fill="gold" />
      </th>
    );
  } else if (rank === 2) {
    return (
      <th className="flex justify-center">
        <Award color="silver" fill="silver" />
      </th>
    );
  } else if (rank === 3) {
    return (
      <th className="flex justify-center">
        <Award color="#cd7f32" fill="#cd7f32" />
      </th>
    );
  }
  return <th className="flex justify-center">{rank}</th>;
}

function generateQuestionColumns(questions: Question[]) {
  return questions.map((question: Question) => <td>{question.title}</td>);
}

function GradientTd({ value }: { value: number }) {
  const start = [255, 77, 79]; // RGB for #52C41A
  const end = [82, 196, 26]; // RGB for #FF4D4F

  const v = Math.max(0, Math.min(100, value));

  // 線性插值
  const r = Math.round(start[0] + ((end[0] - start[0]) * v) / 100);
  const g = Math.round(start[1] + ((end[1] - start[1]) * v) / 100);
  const b = Math.round(start[2] + ((end[2] - start[2]) * v) / 100);

  const color = `rgb(${r}, ${g}, ${b})`;

  return (
    <td
      className="text-center text-white rounded-md"
      style={{ backgroundColor: color }}
    >
      {value}
    </td>
  );
}
