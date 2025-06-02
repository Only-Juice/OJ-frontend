"use client";

import useSWR from "swr";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function Profile() {
  const links = [{ title: "Rank", href: "/rank" }];

  const { data } = useSWR("https://ojapi.ruien.me/api/score/leaderboard");
  const leaderboard = data?.data?.scores ?? [];

  return (
    <div className="flex-1">
      <Breadcrumbs links={links}></Breadcrumbs>
      <div className="w-full flex justify-center gap-10 card flex-1">
        <div className="card-body w-full">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th></th>
                  <th>Name</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((item: any, index: number) => {
                  return (
                    <tr key={index}>
                      {index === 0 ? (
                        <td>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="w-6 h-6"
                          >
                            <path
                              fill="gold"
                              d="M12 2L15 8L22 9L17 14L18 21L12 17L6 21L7 14L2 9L9 8L12 2Z"
                            />
                          </svg>
                        </td>
                      ) : index === 1 ? (
                        <td>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="w-6 h-6"
                          >
                            <path
                              fill="silver"
                              d="M12 2L15 8L22 9L17 14L18 21L12 17L6 21L7 14L2 9L9 8L12 2Z"
                            />
                          </svg>
                        </td>
                      ) : index === 2 ? (
                        <td>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="w-6 h-6"
                          >
                            <path
                              fill="#cd7f32"
                              d="M12 2L15 8L22 9L17 14L18 21L12 17L6 21L7 14L2 9L9 8L12 2Z"
                            />
                          </svg>
                        </td>
                      ) : (
                        <td>{index + 1}</td>
                      )}
                      <td>{item.user_name}</td>
                      <td>{item.score}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
