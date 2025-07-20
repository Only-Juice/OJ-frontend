"use client";
import { useRouter } from "next/navigation";
import { Pen } from "lucide-react";

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
              <td>{new Date(item.startTime).toLocaleString()}</td>
              <td>{new Date(item.endTime).toLocaleString()}</td>
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
