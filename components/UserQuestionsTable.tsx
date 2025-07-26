"use client";

// icon
import { CircleCheck, CircleX } from "lucide-react";

// utils
import { toSystemDateFormat } from "@/utils/datetimeUtils";

type Props = {
  data: {
    id: number;
    title: string;
    startTime: string;
    endTime: string;
    has_question: boolean;
    top_score: number;
    onClick?: () => void;
  }[];
};

export default function Table({ data }: Props) {
  const takeQuestion = async (id: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/gitea/${id}/question`,
        {
          method: "POST",
          headers: {
            accept: "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to post data");
    } catch (error) {
      console.error("Error during POST request:", error);
    }
  };
  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra table-lg">
        <thead>
          <tr>
            <th>Title</th>
            <th>Start date</th>
            <th>End Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={index}
              onClick={async () => {
                if (!item.has_question) {
                  await takeQuestion(item.id);
                }
                item.onClick?.();
              }}
              className="cursor-pointer"
            >
              <td>{item.title}</td>
              <td>{toSystemDateFormat(new Date(item.startTime))}</td>
              <td>{toSystemDateFormat(new Date(item.endTime))}</td>
              <td>
                {item.top_score == 100 ? (
                  <CircleCheck className="text-green-500" />
                ) : (
                  <CircleX className="text-red-500" />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
