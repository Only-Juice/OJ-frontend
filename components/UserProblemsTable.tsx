"use client";
import { useRouter } from "next/navigation";
import { CircleCheck, CircleX } from "lucide-react";

type Props = {
  data: {
    id: number;
    title: string;
    startTime: string;
    endTime: string;
    status: boolean;
    has_question: boolean;
  }[];
};

export default function Table({ data }: Props) {
  const router = useRouter();
  const takeQuestion = async (id: number) => {
    try {
      const response = await fetch(
        `https://ojapi.ruien.me/api/gitea/question/${id}`,
        {
          method: "POST",
          headers: {
            accept: "application/json",
          },
          body: "",
        }
      );

      if (!response.ok) throw new Error("Failed to post data");
      // const data = await response.json();
    } catch (error) {
      console.error("Error during POST request:", error);
    }
  };
  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra table-lg">
        {/* head */}
        <thead>
          <tr>
            {/* <th></th> */}
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
                router.push(`/problem/${item.id}`);
              }}
              className="cursor-pointer"
            >
              {/* <th>{item.id}</th> */}
              <td>{item.title}</td>
              <td>{new Date(item.startTime).toLocaleString()}</td>
              <td>{new Date(item.endTime).toLocaleString()}</td>
              <td>
                {item.status ? (
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
