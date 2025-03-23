"use client";

import Navbar from "@/components/Navbar";
import { useParams } from "next/navigation";

export default function Problem() {
  const params = useParams();
  const id = params.id;
  const content = `
  Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

  You may assume that each input would have exactly one solution, and you may not use the same element twice.

  You can return the answer in any order.
  `;
  return (
    <div>
      <Navbar></Navbar>
      <div className="w-full min-h-screen pt-25 p-10 flex gap-10">
        <div className="w-3/4 ">
          <div className="card bg-base-100 shadow-sm min-h-full">
            <div className="card-body">
              <h2 className="card-title">Question {id}</h2>
              <p className="text-lg">{content}</p>
            </div>
          </div>
        </div>
        <div className="w-1/4">
          <div className="card bg-base-100 w-full shadow-sm min-h-full">
            <div className="card-body">
              <h2 className="card-title">Summit history</h2>
              <ul className="list">
                {Array.from({ length: 10 }).map((_, index) => {
                  return (
                    <li key={index} className="list-row">
                      <p>2025-01-{index + 1}</p>
                      <p>100</p>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
