"use client";

// next.js
import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import useSWR from "swr";

// components
import PaginationTable from "@/components/PaginationTable";

// type
import type {
  SubmitResult,
  TestSuiteSummary,
  TestCase,
  Failure,
  ApiResponse,
} from "@/types/api/common";
import { PublicQuestion, UserQuestion } from "@/types/api/question";

// third-party
import MarkdownPreview from "@uiw/react-markdown-preview";

// icons
import { CircleCheck, CircleX, Copy, RotateCw, Check } from "lucide-react";

// utils
import { toSystemDateFormat } from "@/utils/datetimeUtils";
import { fetchWithRefresh } from "@/utils/fetchUtils";
import { showAlert } from "@/utils/alertUtils";
import { isJsonString } from "@/utils/commonUtils";

const HEIGHT = "max-h-[calc(100vh-12rem)] min-h-[calc(100vh-12rem)]";

export default function Problem() {
  const params = useParams();
  const id = params.questionId;

  // question data
  const { data: questionData } = useSWR<ApiResponse<PublicQuestion>>(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/questions/${id}/question`
  );

  // user question data
  const { data: userQuestionData } = useSWR<ApiResponse<UserQuestion>>(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/questions/user/${id}/question`
  );
  const question = questionData?.data.readme || "Loading...";

  // question git repo url
  const [sshUrl, setSshUrl] = useState("");
  const [httpUrl, setHttpUrl] = useState("");
  useEffect(() => {
    if (!userQuestionData) return;
    setSshUrl(
      `${process.env.NEXT_PUBLIC_GITEA_SSH_BASE_URL}:${userQuestionData?.data.git_repo_url}.git`
    );
    setHttpUrl(
      `${process.env.NEXT_PUBLIC_GITEA_BASE_URL}/${userQuestionData?.data.git_repo_url}.git`
    );
  }, [userQuestionData]);

  const handleRejudge = () => {
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
        return res.json();
      })
      .then((json: ApiResponse<string>) => {
        if (!json.success) {
          throw new Error(json.message || "Failed to rejudge");
        }
        showAlert("Rejudge request sent", "success");
      })
      .catch((error) => {
        showAlert(error.message, "error");
      });
  };

  // submit history data
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);

  const tabRef = useRef<HTMLInputElement>(null);

  const [selectIndex, setSelectIndex] = useState(0);

  // html elements
  return (
    <div className="flex-1 w-full flex gap-8">
      <div className="tabs tabs-border tabs-box flex-2">
        <input
          type="radio"
          name="my_tabs_1"
          className="tab"
          aria-label="Question"
          defaultChecked
        />
        <div className={`tab-content p-2 overflow-y-auto ${HEIGHT}`}>
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
        <div className={`tab-content p-2 overflow-y-auto ${HEIGHT}`}>
          {submitResult &&
          submitResult.score !== undefined &&
          submitResult.score >= 0 &&
          isJsonString(submitResult.message)
            ? SubmitHistoryDetailCollapse(submitResult.message)
            : submitResult?.message}
        </div>
      </div>
      <div className="flex-1 gap-8 flex flex-col max-h-full">
        <div className="card bg-base-100 w-full flex flex-1 ">
          <div className="card-body flex flex-col flex-1 max-h-[70vh]">
            <h2 className="card-title">Submit history</h2>
            <PaginationTable<SubmitResult>
              url={`${process.env.NEXT_PUBLIC_API_BASE_URL}/score/${id}/question`}
              totalField="scores_count"
              dataField="scores"
              theadShow={() => (
                <tr>
                  <th>#</th>
                  <th>Judge Time</th>
                  <th>Score</th>
                </tr>
              )}
              tbodyShow={(item, index, seqNo, descSeqNo) => (
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
                  <td>{descSeqNo}</td>
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
        <div className="flex gap-8 items-center">
          <div className="tabs tabs-border tabs-box flex-1">
            <input
              type="radio"
              name="my_tabs_3"
              className="tab"
              aria-label="SSH"
              defaultChecked
            />
            <div className="tab-content p-2">
              <RepoUrl url={sshUrl} />
            </div>

            <input
              type="radio"
              name="my_tabs_3"
              className="tab"
              aria-label="HTTP"
            />
            <div className="tab-content p-2">
              <RepoUrl url={httpUrl} />
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleRejudge}>
            Rejudge
            <RotateCw />
          </button>
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
        return (
          <div
            className="collapse collapse-arrow bg-base-100 border-base-300 border"
            key={index}
          >
            <input type="checkbox" name={json.name} />
            {/* 物件標題 */}
            <div className="collapse-title font-semibold">
              <div className="flex justify-between">
                <span>{test.name}</span>
                <span>
                  {test.getscore}/{test.maxscore}
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

// 顯示 URL
function RepoUrl({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true); // 按下去後變成勾勾
      showAlert("Copied to clipboard", "success");

      // 一定秒數後再變回去
      setTimeout(() => setCopied(false), 2000); // 2 秒後恢復
    });
  };

  return (
    <div className="join flex-1 w-full">
      <input
        className="input join-item flex-1"
        placeholder="url"
        readOnly
        value={url}
      />

      <button
        className={`btn join-item ${copied ? "btn-success" : "btn-primary"}`}
        onClick={handleCopy}
        disabled={!url}
      >
        {copied ? <Check /> : <Copy />}
      </button>
    </div>
  );
}
