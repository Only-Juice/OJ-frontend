"use client";

// next.js
import useSWR from "swr";

// components
import Breadcrumbs from "@/components/Breadcrumbs";

// icon
import { Award } from "lucide-react";

export default function Rank() {
  const links = [{ title: "Rank", href: "/rank" }];

  const { data } = useSWR(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/score/leaderboard`
  );
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
                      {index < 3 ? (
                        <td>
                          <Award
                            className="w-6 h-6"
                            color={
                              index === 0
                                ? "gold"
                                : index === 1
                                ? "silver"
                                : index === 2
                                ? "#cd7f32"
                                : "gray"
                            }
                            fill={
                              index === 0
                                ? "gold"
                                : index === 1
                                ? "silver"
                                : index === 2
                                ? "#cd7f32"
                                : "gray"
                            }
                          />
                        </td>
                      ) : (
                        <td>{index + 1}</td>
                      )}

                      <td>{item.user_name}</td>
                      <td>{item.total_score}</td>
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
