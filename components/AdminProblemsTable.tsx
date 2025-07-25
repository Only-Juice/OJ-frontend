"use client";

// next.js
import { useRouter } from "next/navigation";

// icons
import { Pen } from "lucide-react";

// utils
import { toLocalString } from "@/utils/datetimeUtils";

type Props = {
  data: {
    id: number;
    title: string;
    startTime: string;
    endTime: string;
    status: boolean;
    onModify: () => void;
  }[];
};

export default function Table({ data }: Props) {
  const router = useRouter();
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
              <td>{toLocalString(new Date(item.startTime))}</td>
              <td>{toLocalString(new Date(item.endTime))}</td>
              <td>
                <input
                  type="checkbox"
                  defaultChecked
                  className="toggle toggle-primary"
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
