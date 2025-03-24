"use client";

import Navbar from "@/components/Navbar";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Problem() {
  // const [repoUrl, setRepoUrl] = useState("");
  const params = useParams();
  const [content, setContent] = useState<string>("");
  const id = params.id;

  // useEffect(() => {
  //   const fetchReadme = async () => {
  //     try {
  //       let repoUrl = sessionStorage.getItem("repoUrl");
  //       const response = await fetch(
  //         `https://gitea.ruien.me/${repoUrl}/src/README.md`,
  //         {
  //           mode: "no-cors",
  //         }
  //       );
  //       console.log(`https://gitea.ruien.me/${repoUrl}/src/README.md`);

  //       if (!response.ok) throw new Error("Failed to fetch README.md");
  //       const text = await response.text();
  //       setContent(text);
  //     } catch (error) {
  //       console.error(error);
  //       setContent("無法加載 README.md");
  //     }
  //   };

  //   fetchReadme();
  // });
  useEffect(() => {
    setContent(`# Test
    Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.
  
    You may assume that each input would have exactly one solution, and you may not use the same element twice.
  
    You can return the answer in any order.
    `);
  });

  return (
    <div>
      <Navbar></Navbar>
      <div className="w-full min-h-screen pt-25 p-10 flex gap-10">
        <div className="flex-3 ">
          <div className="card bg-base-100 shadow-sm min-h-full">
            <div className="card-body">
              <h2 className="card-title">Question {id}</h2>
              <MarkdownPreview
                source={content}
                style={{ padding: 16 }}
              ></MarkdownPreview>
            </div>
          </div>
        </div>
        <div className="flex-1">
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
