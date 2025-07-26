"use client";

// next.js
import { useState } from "react";
import useSWR from "swr";

// components
import Breadcrumbs from "@/components/Breadcrumbs";
import AdminProblemsTable from "@/components/AdminProblemsTable";

// utils
import {
  toDatetimeLocal,
  toLocalISOString,
  toSystemDateFormat,
} from "@/utils/datetimeUtils";

// icons
import { Plus } from "lucide-react";

export default function ProblemPage() {
  const links = [{ title: "Problems", href: "/admin/problem" }];

  const { data: questionData, mutate: mutateQuestion } = useSWR(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/questions`
  );

  const questions =
    (questionData?.data?.questions || []).map((question: any) => {
      return {
        id: question.id,
        title: question.title,
        startTime: question.start_time,
        endTime: question.end_time,
        is_active: question.is_active,
        onModify: () => {
          modifyBtnClick(question);
        },
      };
    }) || [];

  const [id, setId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [gitRepoUrl, setGitRepoUrl] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [error, setError] = useState("");
  const [isCreate, setIsCreate] = useState(true);

  const handleCreate = async () => {
    setError("");

    // 檢查欄位
    if (!title || !description || !gitRepoUrl || !startTime || !endTime) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/questions/admin/question`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            title,
            description,
            git_repo_url: gitRepoUrl,
            start_time: new Date(startTime).toISOString(),
            end_time: new Date(endTime).toISOString(),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create question");
      }
      mutateQuestion();
      document.getElementById("create_modal")?.close();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    }
  };

  const handleUpdate = async () => {
    setError("");

    // 檢查欄位
    if (!title || !description || !gitRepoUrl || !startTime || !endTime) {
      setError("Please fill in all fields");
      return;
    }
    // 發送 PATCH 請求到 /api/question/id/{id}
    const updateUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/questions/admin/${id}/question`;
    const updateBody = {
      title,
      description,
      git_repo_url: gitRepoUrl,
      start_time: new Date(startTime).toISOString(),
      end_time: new Date(endTime).toISOString(),
    };
    const updateResponse = await fetch(updateUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      credentials: "include",
      body: JSON.stringify(updateBody),
    });

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      throw new Error(errorData.message || "Failed to update question");
    }
    mutateQuestion();
    document.getElementById("create_modal")?.close();
  };

  const createBtnClick = () => {
    setError("");
    setTitle("");
    setDescription("");
    setGitRepoUrl("");
    setStartTime("");
    setEndTime("");
    setIsCreate(true);
    document.getElementById("create_modal")?.showModal();
  };

  const modifyBtnClick = (question: any) => {
    setError("");
    setId(question.id);
    setTitle(question.title);
    setDescription(question.description);
    setGitRepoUrl(question.git_repo_url);
    setStartTime(question.start_time);
    setEndTime(question.end_time);
    setIsCreate(false);
    document.getElementById("create_modal")?.showModal();
  };

  return (
    <div className="flex-1">
      <Breadcrumbs links={links}></Breadcrumbs>
      <div className="w-full flex gap-10 flex-1 flex-col">
        <AdminProblemsTable data={questions}></AdminProblemsTable>
      </div>
      <div className="fixed bottom-4 right-4">
        <div className="btn btn-primary" onClick={createBtnClick}>
          Create New Question
          <Plus />
        </div>
      </div>
      {/* dialog */}
      <dialog id="create_modal" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg">
            {isCreate ? "Create New Problem" : "Update Problem"}
          </h3>
          <div className="flex flex-col items-center gap-6 max-w-xl mx-auto mt-5">
            <div className="w-full flex flex-col gap-2">
              <label>Title</label>
              <input
                type="text"
                placeholder="Title"
                className="input input-bordered w-full"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="w-full flex flex-col gap-2">
              <label>Description</label>
              <textarea
                className="textarea textarea-bordered w-full"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            <div className="w-full flex flex-col gap-2">
              <label>GitHub Repository URL</label>
              <input
                type="text"
                placeholder="GitHub Repository URL"
                className="input input-bordered w-full"
                value={gitRepoUrl}
                onChange={(e) => setGitRepoUrl(e.target.value)}
              />
            </div>

            <div className="w-full flex flex-col gap-2">
              <label>Start Time</label>
              <input
                type="datetime-local"
                className="input input-bordered w-full"
                value={toDatetimeLocal(startTime)}
                onChange={(e) => setStartTime(toLocalISOString(e.target.value))}
              />
            </div>

            <div className="w-full flex flex-col gap-2">
              <label>End Time</label>
              <input
                type="datetime-local"
                className="input input-bordered w-full"
                value={toDatetimeLocal(endTime)}
                onChange={(e) => setEndTime(toLocalISOString(e.target.value))}
              />
            </div>

            {error && <p className="text-red-500">{error}</p>}
            {isCreate ? (
              <button className="btn btn-primary w-full" onClick={handleCreate}>
                Create
              </button>
            ) : (
              <button className="btn btn-primary w-full" onClick={handleUpdate}>
                Update
              </button>
            )}
          </div>
        </div>
      </dialog>
    </div>
  );
}
