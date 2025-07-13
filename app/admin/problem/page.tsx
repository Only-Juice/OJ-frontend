"use client";
import { useState } from "react";
import useSWR, { mutate } from "swr";
import { Plus } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import AdminProblemsTable from "@/components/AdminProblemsTable";
import { toDatetimeLocal, toLocalISOString } from "@/utils/datetimeUtils";
import { on } from "events";

export default function ProblemPage() {
  const links = [{ title: "Problems", href: "/admin/problem" }];

  const { data: questionData, mutate: mutateQuestion } = useSWR(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/questions`
  );

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
      setError("請填寫所有欄位");
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
        throw new Error(errorData.message || "建立題目失敗");
      }
      mutateQuestion();
      document.getElementById("create_modal")?.close();
    } catch (err: any) {
      setError(err.message || "發生錯誤");
    }
  };

  const handleUpdate = async () => {
    setError("");

    // 檢查欄位
    if (!title || !description || !gitRepoUrl || !startTime || !endTime) {
      setError("請填寫所有欄位");
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
      throw new Error(errorData.message || "更新題目失敗");
    }
    mutateQuestion();
    document.getElementById("create_modal")?.close();
  };

  const handleDelete = async () => {};

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

  const deleteBtnClick = (question: any) => {
    setId(question.id);
    setTitle(question.title);
    document.getElementById("delete_modal")?.showModal();
  };

  const questions =
    (questionData?.data?.questions || []).map((question: any) => {
      return {
        id: question.id,
        title: question.title,
        startTime: question.start_time,
        endTime: question.end_time,
        onModify: () => {
          modifyBtnClick(question);
        },
        onDelete: () => {
          deleteBtnClick(question);
        },
      };
    }) || [];
  return (
    <div className="flex-1">
      <Breadcrumbs links={links}></Breadcrumbs>
      <div className="w-full flex gap-10 flex-1 flex-col">
        <div className="w-full flex justify-end">
          <div className="btn btn-primary" onClick={createBtnClick}>
            Create New Question
            <Plus />
          </div>
        </div>
        <AdminProblemsTable data={questions}></AdminProblemsTable>
      </div>
      <dialog id="delete_modal" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg">Delete Problem</h3>
          <p className="py-4">Sure delete problem "{title}"</p>
          <div className="flex">
            <div className="btn btn-outline">Cancel</div>
            <div className="flex-1" />
            <div className="btn btn-error">Delete</div>
          </div>
        </div>
      </dialog>
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
            <input
              type="text"
              placeholder="title"
              className="input input-bordered w-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className="textarea textarea-bordered w-full"
              placeholder="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
            <input
              type="text"
              placeholder="git repo url"
              className="input input-bordered w-full"
              value={gitRepoUrl}
              onChange={(e) => setGitRepoUrl(e.target.value)}
            />
            <div className="w-full flex flex-row gap-4">
              <input
                type="datetime-local"
                className="input input-bordered flex-1"
                value={toDatetimeLocal(startTime)}
                onChange={(e) => setStartTime(toLocalISOString(e.target.value))}
              />
              <input
                type="datetime-local"
                className="input input-bordered flex-1"
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
