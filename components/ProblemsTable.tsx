"use client";
import { useRouter } from "next/navigation";

type TableProps = {
  data: {
    id: number;
    title: string;
    startDate: string;
    endDate: string;
    status: boolean;
  }[];
};

export default function Table({ data }: TableProps) {
  const router = useRouter();
  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra table-lg">
        {/* head */}
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
              onClick={() => {
                router.push(`/problem/${item.id}`);
              }}
              className="cursor-pointer"
            >
              <td>{item.title}</td>
              <td>{item.startDate}</td>
              <td>{item.endDate}</td>
              <td>
                {item.status ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="green"
                    className="size-8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="red"
                    className="size-8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
