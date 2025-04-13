"use client";

import Navbar from "@/components/Navbar";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Problem() {
  // const [repoUrl, setRepoUrl] = useState("");
  const params = useParams();
  const [content, setContent] = useState<string>("");
  const [scoreHistory, setScoreHistory] = useState<any>(null);
  const [selectHistory, setSelectHistory] = useState<any>(null);

  const id = params.id;

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
        setContent(data.data.readme || "No content available");
      } catch (error) {
        console.error(error);
        setContent("Failed to load question content");
      }
    };

    const getScoreHistory = async () => {
      try {
        const response = await fetch(
          `https://ojapi.ruien.me/api/score/question/${id}`,
          {
            method: "GET",
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch summit history");
        const data = await response.json();
        setScoreHistory(data.data.scores);
      } catch (error) {
        console.error(error);
      }
    };

    (async () => {
      await takeQuestion();
      await getQuestionReadme();
      await getScoreHistory();
    })();
  });

  return (
    <div>
      <Navbar></Navbar>
      <div className="w-full min-h-screen pt-25 p-10 flex gap-10">
        {/* name of each tab group should be unique */}
        <div className="tabs tabs-box flex-3">
          <input
            type="radio"
            name="my_tabs_6"
            className="tab"
            aria-label="Question"
            defaultChecked
          />
          <div className="tab-content p-2">
            <MarkdownPreview
              className="rounded-lg"
              source={content}
              style={{ padding: 16 }}
            ></MarkdownPreview>
          </div>
          {selectHistory !== null && (
            <>
              <input
                type="radio"
                name="my_tabs_6"
                className="tab"
                aria-label="Summit history details"
              />
              <div className="tab-content p-2">
                {Array.from({ length: 5 }).map((_, index) => {
                  return (
                    <div
                      className="collapse collapse-arrow bg-base-100 border-base-300 border"
                      key={index}
                    >
                      <input type="checkbox" />
                      <div className="collapse-title font-semibold">
                        How do I create an account?
                      </div>
                      <div className="collapse-content text-sm">
                        Click the "Sign Up" button in the top right corner and
                        follow the registration process.
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
        <div className="flex-1 gap-10 flex flex-col">
          <div className="card bg-base-100 w-full shadow-sm min-h-[75vh] max-h-[75vh]">
            <div className="card-body h-full">
              <h2 className="card-title">Summit history</h2>
              <ul className="list overflow-y-auto max-h-full">
                {scoreHistory !== null &&
                  scoreHistory.map((score: any, index: number) => (
                    <li key={index} className="list-row">
                      <p>{new Date(score.judge_time).toLocaleString()}</p>
                      <p>{score.score}</p>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
          <button className="btn btn-primary">Copy SSH url</button>
        </div>
      </div>
    </div>
  );
}
