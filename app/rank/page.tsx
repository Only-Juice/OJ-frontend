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
    <div>
      <Navbar></Navbar>
      <div className="w-full pt-25 p-10 flex justify-center gap-10 min-h-screen card">
        <div className="card-body w-full">
          <div className="overflow-x-auto">
            <table className="table">
              {/* head */}
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
                      <th>{index + 1}</th>
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
