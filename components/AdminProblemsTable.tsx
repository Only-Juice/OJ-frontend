"use client";

// icons
import { Pen } from "lucide-react";

// utils
import { toSystemDateFormat } from "@/utils/datetimeUtils";
import { fetchWithRefresh } from "@/utils/apiUtils";

type Props = {
  data: {
    id: number;
    title: string;
    startTime: string;
    endTime: string;
    is_active: boolean;
    onModify: () => void;
  }[];
};

export default function Table({ data }: Props) {
  const handleProblemStatusChange = (id: number, new_is_active: boolean) => {
    try {
      fetchWithRefresh(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/questions/admin/${id}/question`,
        {
          method: "PATCH",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            description: "Question Description",
            end_time: "2006-01-02T15:04:05Z",
            git_repo_url: "user_name/repo_name",
            start_time: "2006-01-02T15:04:05Z",
            title: "Question Title",
            is_active: false,
          }),
        }
      );
    } catch (error) {
      console.error("Error updating user visibility:", error);
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
            <th>Modify</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              {/* <th>{item.id}</th> */}
              <td>{item.title}</td>
              <td>{toSystemDateFormat(new Date(item.startTime))}</td>
              <td>{toSystemDateFormat(new Date(item.endTime))}</td>
              <td>
                <input
                  type="checkbox"
                  checked={item.is_active}
                  className="toggle toggle-primary"
                  onChange={(e) =>
                    handleProblemStatusChange(item.id, e.target.checked)
                  }
                />
              </td>
              <td>
                <div className="btn btn-ghost btn-sm" onClick={item.onModify}>
                  <Pen />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
