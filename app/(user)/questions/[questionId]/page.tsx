"use client";

// next.js
import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import useSWR from "swr";

// components
import Breadcrumbs from "@/components/Breadcrumbs";

// third-party
import MarkdownPreview from "@uiw/react-markdown-preview";

// icons
import { CircleCheck, CircleX, Copy, RotateCw } from "lucide-react";

// utils
import { toSystemDateFormat } from "@/utils/datetimeUtils";
import { fetchWithRefresh } from "@/utils/apiUtils";

const LIMIT = 10;

export default function Problem() {
  const params = useParams();
  const id = params.questionId;

  // question data
  const { data: questionData } = useSWR(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/questions/user/${id}/question`
  );
  const question = questionData?.data.readme || "Loading...";

  const links = [
    { title: "Questions", href: "/questions" },
    { title: `${questionData?.data.title}`, href: `/questions/${id}` },
  ];

  // question git repo url
  const [sshUrl, setSshUrl] = useState("");
  useEffect(() => {
    setSshUrl(
      `${process.env.NEXT_PUBLIC_GITEA_BASE_URL}/${questionData?.data?.git_repo_url}.git`
    );
  }, [questionData]);

  // history data
  const [historyIndex, setHistoryIndex] = useState(0);

  const [historyPage, setHistoryPage] = useState(1);

  const tabRef = useRef<HTMLInputElement>(null);

  const { data: historyData } = useSWR(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/score/${id}/question?page=${historyPage}&limit=${LIMIT}`
  );
  const histories = historyData?.data || null;

  const addHistoryPage = () => {
    const totalPage = Math.ceil(historyData?.data?.scores_count / LIMIT);
    if (historyPage >= totalPage) return;
    setHistoryPage((prev) => prev + 1);
    setHistoryIndex(0);
  };

  const subtractHistoryPage = () => {
    setHistoryPage((prev) => (prev > 1 ? prev - 1 : 1));
    setHistoryIndex(0);
  };

  // html elements
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
            ref={tabRef}
            type="radio"
            name="my_tabs_1"
            className="tab"
            aria-label="Submit history details"
          />
          <div className="tab-content p-2">
            {histories?.scores[historyIndex]?.score >= 0
              ? SubmitHistoryDetailCollapse(
                  histories?.scores[historyIndex].message
                )
              : histories?.scores[historyIndex].message}
          </div>
        </div>
        <div className="flex-1 gap-10 flex flex-col sticky top-35 self-start">
          <div className="card bg-base-100 w-full shadow-sm h-[70vh]">
            <div className="card-body h-full flex flex-col">
              <h2 className="card-title">Submit history</h2>
              <div className="overflow-y-auto flex-1">
                {histories?.scores ? (
                  SubmitHistoryTable(
                    histories.scores,
                    historyIndex,
                    historyData?.data?.scores_count - (historyPage - 1) * LIMIT,
                    (index) => {
                      tabRef.current?.click();
                      setHistoryIndex(index);
                    }
                  )
                ) : (
                  <p className="text-center">No submission history found.</p>
                )}
              </div>
              <div className="join items-center justify-center mt-4">
                <button className="join-item btn" onClick={subtractHistoryPage}>
                  «
                </button>
                <button className="join-item btn">Page {historyPage}</button>
                <button className="join-item btn" onClick={addHistoryPage}>
                  »
                </button>
              </div>
            </div>
          </div>
          <SSHUrlAndRejudgeButton
            sshUrl={sshUrl}
            onRejudge={() => {
              fetchWithRefresh(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/score/${id}/question/user_rescore`,
                {
                  method: "POST",
                  headers: {
                    accept: "application/json",
                  },
                  credentials: "include",
                }
              )
                .then((res) => {
                  if (!res.ok) {
                    throw new Error("Failed to rejudge");
                  }
                  setHistoryIndex(0);
                  return res.json();
                })
                .catch((error) => {
                  console.error("Error:", error);
                });
            }}
          />
        </div>
      </div>
    </div>
  );
}

// 一組可打開的物件，一次只會打開一個，用於顯示提交歷史的詳細資料
function SubmitHistoryDetailCollapse(message: string) {
  const json = JSON.parse(message);
  const testsuites = json.testsuites || [];
  return (
    <div>
      {testsuites.map((test: any, index: number) => {
        let pass = test.tests - test.failures - test.disabled - test.errors;
        {
          /* 可打開的物件 */
        }
        return (
          <div
            className="collapse collapse-arrow bg-base-100 border-base-300 border"
            key={index}
          >
            <input type="radio" name={json.name} />
            {/* 物件標題 */}
            <div className="collapse-title font-semibold">
              <div className="flex justify-between">
                <span>{test.name}</span>
                <span>
                  {pass}/{test.tests}
                </span>
              </div>
            </div>
            {/* 打開後的內容 */}
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
      })}
    </div>
  );
}

// 顯示提交歷史分數的 table
function SubmitHistoryTable(
  histories: any[],
  historyIndex: number,
  startIndex: number,
  setHistoryIndex: (index: number) => void
) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>#</th>
          <th>Time</th>
          <th>Score</th>
        </tr>
      </thead>
      <tbody>
        {histories.map((score: any, index: number) => {
          const displayNumber = startIndex - index;
          return (
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
              <th>{displayNumber}</th>
              <td>{toSystemDateFormat(new Date(score.judge_time))}</td>
              <td>{score.score >= 0 ? score.score : score.message}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// 顯示 SSH URL 和重新評分按鈕的組件
function SSHUrlAndRejudgeButton({
  sshUrl,
  onRejudge,
}: {
  sshUrl: string;
  onRejudge: () => void;
}) {
  const handleCopy = () => {
    navigator.clipboard.writeText(sshUrl).then(
      () => {
        alert("SSH URL copied to clipboard!");
      },
      (err) => {}
    );
  };
  return (
    <div className="flex gap-8">
      <div className="join flex-1">
        <input
          className="input join-item flex-1"
          placeholder="ssh url"
          readOnly
          value={sshUrl}
        />
        <button className="btn btn-primary join-item" onClick={handleCopy}>
          <Copy />
        </button>
      </div>
      <button className="btn btn-primary" onClick={onRejudge}>
        Rejudge
        <RotateCw />
      </button>
    </div>
  );
}
