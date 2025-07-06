"use client";

import { Award } from "lucide-react";

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
