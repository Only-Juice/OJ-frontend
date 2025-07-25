"use client";

// next.js
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import useSWR from "swr";

// components
import Breadcrumbs from "@/components/Breadcrumbs";

// third-party
import MarkdownPreview from "@uiw/react-markdown-preview";

// icons
import { CircleCheck, CircleX, Copy, RotateCw } from "lucide-react";

// utils
import { toLocalString } from "@/utils/datetimeUtils";

export default function Problem() {
  const params = useParams();
  const id = params.questionId;

  const links = [
    { title: "Problems", href: "/problem" },
    { title: `Problem ${id}`, href: `/problem/${id}` },
  ];

  const [historyPage, setHistoryPage] = useState(1);
  const { data: historyData } = useSWR(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/score/${id}/question`,
    {
      refreshInterval: 3000,
    }
  );
  const histories = historyData?.data || null;
  const [historyIndex, setHistoryIndex] = useState(0);

  const { data: questionData } = useSWR(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/questions/user/${id}/question`
  );
  const question = questionData?.data.readme || "Loading...";

  const [sshUrl, setSshUrl] = useState("");
  useEffect(() => {
    setSshUrl(
      `${process.env.NEXT_PUBLIC_GITEA_BASE_URL}/${questionData?.data?.git_repo_url}.git`
    );
  }, [questionData]);

  return (
    <div className="flex-1">
      <Breadcrumbs links={links}></Breadcrumbs>
      <div className="w-full flex gap-10 flex-1">
        <div className="tabs tabs-border tabs-box flex-2">
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
              source={question}
              style={{ padding: 16 }}
            ></MarkdownPreview>
          </div>
          <input
            type="radio"
            name="my_tabs_1"
            className="tab"
            aria-label="Submit history details"
          />
          <div className="tab-content p-2">
            {histories?.scores[historyIndex].score >= 0
              ? JSON.parse(
                  histories?.scores[historyIndex].message
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
                              <CircleX className="text-red-500 size-8" />
                            ) : (
                              <CircleCheck className="text-green-500 size-8" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              : histories?.scores[historyIndex].message}
          </div>
        </div>
        <div className="flex-1 gap-10 flex flex-col sticky top-35 self-start">
          <div className="card bg-base-100 w-full shadow-sm h-[70vh]">
            <div className="card-body h-full">
              <h2 className="card-title">Submit history</h2>
              <div className="overflow-y-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Time</th>
                      <th>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {histories?.scores?.map((score: any, index: number) => (
                      <tr
                        key={index}
                        className={`cursor-pointer ${
                          historyIndex === index
                            ? "bg-primary text-primary-content"
                            : "hover:bg-base-200"
                        }`}
                        onClick={() => {
                          setHistoryIndex(index);
                        }}
                      >
                        <th>{index + 1}</th>
                        <td>{toLocalString(new Date(score.judge_time))}</td>
                        <td>
                          {score.score >= 0 ? score.score : score.message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="flex gap-8">
            <div className="join flex-1">
              <input
                className="input join-item"
                placeholder="ssh url"
                readOnly
                value={sshUrl}
              />
              <button className="btn btn-primary join-item">
                <Copy />
              </button>
            </div>
            <button
              className="btn btn-primary"
              onClick={async () => {
                try {
                  const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/score/${id}/question/user_rescore`,
                    {
                      method: "POST",
                      headers: {
                        accept: "application/json",
                      },
                      credentials: "include",
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
              Rejudge
              <RotateCw />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
