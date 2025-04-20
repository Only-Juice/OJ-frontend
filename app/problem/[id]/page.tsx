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
  const [historyIndex, setHistoryIndex] = useState<number>(0);

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
        // const data = await response.json();
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
      <div className="w-full h-full pt-25 p-10 flex gap-10">
        <div className="tabs tabs-border tabs-box flex-3">
          <input
            type="radio"
            name="my_tabs_1"
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
          <input
            type="radio"
            name="my_tabs_1"
            className="tab"
            aria-label="Summit history details"
          />
          <div className="tab-content p-2">
            {scoreHistory !== null
              ? JSON.parse(scoreHistory[historyIndex].message).testsuites.map(
                  (test: any, index: number) => {
                    let pass =
                      test.tests - test.failures - test.disabled - test.errors;
                    return (
                      <div
                        className="collapse collapse-arrow bg-base-100 border-base-300 border"
                        key={index}
                      >
                        <input type="checkbox" />
                        <div className="collapse-title font-semibold">
                          <div className="flex justify-between">
                            <span>{test.name}</span>
                            <span>
                              {pass}/{test.tests}
                            </span>
                          </div>
                        </div>
                        <div className="collapse-content text-sm list">
                          {Array.from(test.testsuite).map((t: any, i) => (
                            <div key={i} className="list-row">
                              <p>{t.name}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                )
              : "No data"}
          </div>
        </div>
        <div className="flex-1 gap-10 flex flex-col sticky top-25 self-start">
          <div className="card bg-base-100 w-full shadow-sm min-h-[75vh] max-h-[75vh]">
            <div className="card-body h-full">
              <h2 className="card-title">Summit history</h2>
              <ul className="list overflow-y-auto">
                {scoreHistory !== null &&
                  scoreHistory.map((score: any, index: number) => (
                    <li
                      key={index}
                      className="list-row"
                      onClick={() => {
                        setHistoryIndex(index);
                      }}
                    >
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
