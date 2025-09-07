"use client";

// next.js
import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import useSWR from "swr";

// components
import PaginationTable from "@/components/PaginationTable";

// third-party
import MarkdownPreview from "@uiw/react-markdown-preview";

// icons
import { CircleCheck, CircleX, Copy, RotateCw } from "lucide-react";

// utils
import { toSystemDateFormat } from "@/utils/datetimeUtils";
import { fetchWithRefresh } from "@/utils/fetchUtils";

// type
import type {
  SubmitResult,
  TestSuiteSummary,
  TestCase,
  Failure,
} from "@/types/api/common";

export default function Problem() {
  const params = useParams();
  const examId = params.examId;
  const id = params.questionId;

  // exam data
  const { data: examData } = useSWR(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/exams/${examId}/exam`
  );

  // question data
  const { data: questionData } = useSWR(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/questions/${id}/question`
  );

  const question = questionData?.data.readme || "Loading...";

  // question git repo url
  const [sshUrl, setSshUrl] = useState("");
  useEffect(() => {
    setSshUrl(
      `${process.env.NEXT_PUBLIC_GITEA_BASE_URL}/${questionData?.data?.git_repo_url}.git`
    );
  }, [questionData]);

  // submit history data
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);

  const tabRef = useRef<HTMLInputElement>(null);

  const [selectIndex, setSelectIndex] = useState(0);

  // html elements
  return (
    <div className="flex-1">
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
            {submitResult &&
            submitResult.score !== undefined &&
            submitResult.score >= 0
              ? SubmitHistoryDetailCollapse(submitResult.message)
              : submitResult?.message}
          </div>
        </div>
        <div className="flex-1 gap-10 flex flex-col sticky top-35 self-start">
          <div className="card bg-base-100 w-full shadow-sm h-[70vh]">
            <div className="card-body h-full flex flex-col">
              <h2 className="card-title">Submit history</h2>
              <PaginationTable<SubmitResult>
                url={`${process.env.NEXT_PUBLIC_API_BASE_URL}/score/${id}/question`}
                limit={10}
                totalField="scores_count"
                dataField="scores"
                theadShow={() => (
                  <tr>
                    <th>#</th>
                    <th>Judge Time</th>
                    <th>Score</th>
                  </tr>
                )}
                tbodyShow={(item, index, total, page) => (
                  <tr
                    key={index}
                    className={`cursor-pointer ${
                      selectIndex === index
                        ? "bg-primary text-primary-content"
                        : "hover:bg-base-200"
                    }`}
                    onClick={() => {
                      setSubmitResult(item);
                      setSelectIndex(index);
                      tabRef.current?.click();
                    }}
                  >
                    <td>{total - index - (page - 1) * 10}</td>
                    <td>{toSystemDateFormat(new Date(item.judge_time))}</td>
                    {item.score >= 0 ? (
                      <td>{item.score}</td>
                    ) : (
                      <td>{item.message}</td>
                    )}
                  </tr>
                )}
                onDataLoaded={(data) => {
                  setSelectIndex(0);
                  setSubmitResult(data[0]);
                }}
              />
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
                  // setHistoryIndex(0);
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
      {testsuites.map((test: TestSuiteSummary, index: number) => {
        const pass = test.tests - test.failures - test.disabled - test.errors;
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
              {Array.from(test.testsuite).map((t: TestCase, i) => (
                <div
                  key={i}
                  className="list-row flex justify-between items-center flex-col"
                >
                  <div className="flex flex-row w-full">
                    <p>{t.name}</p>
                    <div className="flex-1"></div>
                    {t.failures?.length ? (
                      <CircleX className="text-red-500 size-8" />
                    ) : (
                      <CircleCheck className="text-green-500 size-8" />
                    )}
                  </div>
                  {t.failures?.length ? (
                    <ul className="text-sm text-red-600 mt-2 list-disc ml-6">
                      {t.failures.map((f: Failure, i) => (
                        <li key={i}>{f.failure}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
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
