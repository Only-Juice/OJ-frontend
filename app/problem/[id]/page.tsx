"use client";

import Breadcrumbs from "@/components/Breadcrumbs";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Problem() {
  // const [repoUrl, setRepoUrl] = useState("");
  const params = useParams();
  const [content, setContent] = useState("Loading...");
  const [history, setHistory] = useState(null);
  // const [scoreHistory, setScoreHistory] = useState<any>(null);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [historyPage, setHistoryPage] = useState(1);

  const id = params.id;
  const links = [
    { title: "Problem", href: "/problem" },
    { title: `Problem ${id}`, href: `/problem/${id}` },
  ];

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let isFetching = false;

    const getScoreHistory = async () => {
      if (isFetching) return;
      isFetching = true;

      try {
        const response = await fetch(
          `https://ojapi.ruien.me/api/score/question/${id}?page=${historyPage}`,
          {
            method: "GET",
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch score history");

        const data = await response.json();
        setHistory(data.data);
      } catch (error) {
        console.error(error);
      } finally {
        isFetching = false;
      }
    };

    getScoreHistory();
    intervalId = setInterval(getScoreHistory, 1000);

    return () => clearInterval(intervalId);
  }, [historyPage]);

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

    takeQuestion();
    getQuestionReadme();
  }, []);

  return (
    <div>
      <Breadcrumbs links={links}></Breadcrumbs>
      <div className="w-full flex gap-10 flex-1">
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
            {history?.scores[historyIndex].score >= 0
              ? JSON.parse(
                  history?.scores[historyIndex].message
                ).testsuites.map((test: any, index: number) => {
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
                      <div className="collapse-content text-lg list">
                        {Array.from(test.testsuite).map((t: any, i) => (
                          <div
                            key={i}
                            className="list-row flex justify-between items-center"
                          >
                            <p>{t.name}</p>
                            {t.failures > 0 ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="red"
                                className="size-8"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="green"
                                className="size-8"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                />
                              </svg>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              : "No data"}
          </div>
        </div>
        <div className="flex-1 gap-10 flex flex-col sticky top-35 self-start">
          <div className="card bg-base-100 w-full shadow-sm h-[70vh]">
            <div className="card-body h-full">
              <h2 className="card-title">Summit history</h2>
              <ul className="list overflow-y-auto flex-1 text-xs">
                {history?.scores?.map((score: any, index: number) => (
                  <li
                    key={index}
                    className={`list-row cursor-pointer   ${
                      historyIndex === index
                        ? "bg-primary text-primary-content"
                        : "hover:bg-base-200"
                    }`}
                    onClick={() => {
                      setHistoryIndex(index);
                    }}
                  >
                    <p>{new Date(score.judge_time).toLocaleString()}</p>
                    {score.score >= 0 ? (
                      <p>{score.score}</p>
                    ) : (
                      <p>{score.message}</p>
                    )}
                  </li>
                ))}
              </ul>
              <div className="join justify-center">
                <button
                  className="join-item btn"
                  onClick={() => {
                    if (historyPage > 1) {
                      setHistoryPage(historyPage - 1);
                    }
                  }}
                >
                  «
                </button>
                <button className="join-item btn">Page {historyPage}</button>
                <button
                  className="join-item btn"
                  onClick={() => {
                    if (history?.scores_count > historyPage * 10) {
                      setHistoryPage(historyPage + 1);
                    }
                  }}
                >
                  »
                </button>
              </div>
            </div>
          </div>
          <div className="flex gap-10">
            <div className="join">
              <input className="input join-item" placeholder="ssh url" />
              <button className="btn btn-primary join-item">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  className="fill-[var(--color-primary-content)]"
                >
                  <path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z" />
                </svg>
              </button>
            </div>
            <button
              className="btn btn-primary flex-1"
              onClick={async () => {
                try {
                  const response = await fetch(
                    `https://ojapi.ruien.me/api/score/user/rescore/${id}`,
                    {
                      method: "POST",
                      headers: {
                        accept: "application/json",
                        Authorization: `Bearer ${sessionStorage.getItem(
                          "authToken"
                        )}`,
                      },
                      body: "",
                    }
                  );

                  if (!response.ok) throw new Error("Failed to rescore");
                  const data = await response.json();
                  setHistoryIndex(0);
                  console.log("Rescore successful:", data);
                } catch (error) {
                  console.error("Error during rescore request:", error);
                }
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                className="fill-[var(--color-primary-content)]"
              >
                <path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z" />
              </svg>
              Rejudge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
