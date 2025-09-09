"use client";

// type
import type { Question, Rank } from "@/types/api/common";
import PaginationTable from "./PaginationTable";

// icon
import { Award } from "lucide-react";

interface LeaderboardProps {
  questions: Question[];
  leaderboardUrl: string;
}

export default function Leaderboard({
  questions,
  leaderboardUrl,
}: LeaderboardProps) {
  return (
    <PaginationTable<Rank>
      classname="table-pin-rows table-pin-cols border-separate border-spacing-2"
      url={leaderboardUrl}
      limit={15}
      totalField="count"
      dataField="scores"
      theadShow={() => (
        <tr>
          <th className="text-center">#</th>
          <th>Username</th>
          {generateQuestionHeader(questions)}
          <th className="text-center">Total Score</th>
        </tr>
      )}
      tbodyShow={(item, index, seqNo, descSeqNo) => (
        <tr key={index}>
          {generateRankCell(index, seqNo)}
          <th>{item.user_name}</th>
          {questions.map((question: Question) =>
            generateScoreCell(question, item)
          )}
          <th className="text-center">{item.total_score}</th>
        </tr>
      )}
    />
  );
}

// 排名
function generateRankCell(index: number, seqNo: number) {
  const rank = seqNo;
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

// 題目表頭
function generateQuestionHeader(questions: Question[]) {
  // Generate table headers
  return questions.map((question: Question) => (
    <th className="text-center" key={question.id}>
      {question.title}
    </th>
  ));
}

//
function generateScoreCell(question: Question, rank: Rank) {
  const score = rank.question_scores.find((q) => q.question_id === question.id);
  return <GradientTd value={score ? score.score : 0} key={question.id} />;
}

// 顏色漸層的 td
function GradientTd({ value }: { value: number }) {
  const start = [214, 69, 69]; // RGB for #3A9D23
  const end = [58, 157, 35]; // RGB for #D64545

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
