"use client";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

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
            Authorization: `Bearer ${Cookies.get("auth")}`,
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
            <th></th>
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
              <th>{index + 1}</th>
              <td>{item.title}</td>
              <td>{new Date(item.startTime).toLocaleString()}</td>
              <td>{new Date(item.endTime).toLocaleString()}</td>
              <td>
                {item.status ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="green"
                  >
                    <path d="m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="red"
                  >
                    <path d="m336-280 144-144 144 144 56-56-144-144 144-144-56-56-144 144-144-144-56 56 144 144-144 144 56 56ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
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
