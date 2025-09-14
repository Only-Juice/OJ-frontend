"use client";

// next.js
import { useParams } from "next/navigation";
import useSWR from "swr";

// types
import { ApiResponse, Question } from "@/types/api/common";
import { Score } from "@/types/api/admin/question/score";

// utils
import { Gradient } from "@/utils/colorUtils";

export default function ScorePage() {
  const params = useParams();
  const id = params.questionId;

  const { data: questionData } = useSWR<ApiResponse<Question>>(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/questions/${id}/question`
  );

  const { data: scoresData, isLoading } = useSWR<ApiResponse<Score[]>>(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/questions/${id}/export?format=json`
  );

  const handleExportCSV = () => {
    if (!scoresData?.data) return;

    const csvRows = [
        ["Username", "Score"],
        ...scoresData.data.map(score => [score.user_name, score.score])
    ];

    const csvContent = csvRows
        .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(","))
        .join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `scores_${id}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className=" flex-1 flex flex-col max-h-full gap-4">
      <div className="text-lg font-bold flex gap-4">
        {questionData?.data.title}{" "}
        {isLoading && <span className="loading loading-spinner loading-lg" />}
      </div>
      <div className="flex justify-end items-end">
        <button
          className="btn btn-primary btn-sm"
          disabled={isLoading}
          onClick={handleExportCSV}
        >
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="table w-full table-zebra table-pin-rows border-separate border-spacing-2">
          <thead>
            <tr>
              <th>Username</th>
              <th className="text-center">Score</th>
            </tr>
          </thead>
          <tbody>
            {scoresData?.data.map((score, index) => (
              <tr key={index}>
                <td>{score.user_name}</td>
                <td
                  className="text-center"
                  style={{
                    backgroundColor: ` ${Gradient({ value: score.score })}`,
                  }}
                >
                  {score.score}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end items-end">
        <div>{scoresData?.data.length} items</div>
      </div>
    </div>
  );
}
