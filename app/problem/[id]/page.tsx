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
    const takeQuestion = async () => {
      try {
        const response = await fetch(
          `https://ojapi.ruien.me/api/gitea/question/${id}`,
          {
            method: "POST",
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            },
            body: "",
          }
        );

        if (!response.ok) throw new Error("Failed to post data");
        const data = await response.json();
        console.log("Post request successful:", data);
      } catch (error) {
        console.error("Error during POST request:", error);
      }
    };

    const getQuestionReadme = async () => {
      try {
        const response = await fetch(
          `https://ojapi.ruien.me/api/question/user/id/${id}`,
          {
            method: "GET",
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch question data");
        const data = await response.json();
        console.log(data);

        setContent(data.data.readme || "No content available");
      } catch (error) {
        console.error(error);
        setContent("Failed to load question content");
      }
    };
    (async () => {
      await takeQuestion();
      await getQuestionReadme();
    })();
  });

  return (
    <div>
      <Navbar></Navbar>
      <div className="w-full min-h-screen pt-25 p-10 flex gap-10">
        <div className="flex-3">
          <div className="card bg-base-100 shadow-sm min-h-full">
            <div className="card-body">
              <h2 className="card-title">Question {id}</h2>
              <MarkdownPreview
                className="rounded-lg"
                source={content}
                style={{ padding: 16 }}
              ></MarkdownPreview>
            </div>
          </div>
        </div>
        <div className="flex-1 gap-10 flex flex-col">
          <div className="card bg-base-100 w-full shadow-sm min-h-[75vh] max-h-[75vh]">
            <div className="card-body h-full">
              <h2 className="card-title">Summit history</h2>
              <ul className="list overflow-y-auto max-h-full">
                {Array.from({ length: 20 }).map((_, index) => {
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
          <button className="btn btn-primary">Copy SSH url</button>
        </div>
      </div>
    </div>
  );
}
