"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

export default function Profile() {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const response = await fetch(
          "https://ojapi.ruien.me/api/score/leaderboard",
          {
            headers: {
              accept: "application/json",
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setLeaderboard(data.data.scores);
        } else {
          console.error("Failed to fetch leaderboard");
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      }
    }

    fetchLeaderboard();
  }, []);
  return (
    <Navbar links={[{ title: "Rank", href: "/rank" }]}>
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
    </Navbar>
  );
}
