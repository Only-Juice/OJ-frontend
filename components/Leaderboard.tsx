"use client";

// type
import type { Question, Rank } from "@/types/api/common";
import PaginationTable from "./PaginationTable";

// icon
import { Award } from "lucide-react";

// utils
import { Gradient } from "@/utils/colorUtils";

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
  return (
    <td
      className="text-center"
      style={{
        backgroundColor: ` ${Gradient({ value: score ? score.score : 0 })}`,
      }}
    >
      {score ? score.score : 0}
    </td>
  );
}
