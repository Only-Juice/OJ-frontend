"use client";

// next.js
import { useState } from "react";
import { useRouter } from "next/navigation";

// components
import PaginationTable from "@/components/PaginationTable";
import DateTimePicker from "@/components/DatePicker";

// utils
import {
  toISOStringFromLocal,
  toSystemDateFormat,
} from "@/utils/datetimeUtils";
import { fetchWithRefresh } from "@/utils/fetchUtils";

// icons
import { Plus, Pen, Trophy } from "lucide-react";

// types
import { Question } from "@/types/api/common";

export default function Questions() {
  const router = useRouter();

  const [id, setId] = useState<number | null>(null);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [gitRepoUrl, setGitRepoUrl] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
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
      const response = await fetchWithRefresh(
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
      (document.getElementById("create_modal") as HTMLDialogElement)?.close();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "An error occurred");
      } else {
        setError("An unknown error occurred");
      }
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
    const updateResponse = await fetchWithRefresh(updateUrl, {
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
    // mutateQuestion();
    (document.getElementById("create_modal") as HTMLDialogElement)?.close();
  };

  const createBtnClick = () => {
    setError("");
    setTitle("");
    setDescription("");
    setGitRepoUrl("");
    setStartTime("");
    setEndTime("");
    setIsCreate(true);
    (document.getElementById("create_modal") as HTMLDialogElement)?.showModal();
  };

  const modifyBtnClick = (question: Question) => {
    setError("");
    setId(question.id);
    setTitle(question.title);
    setDescription(question.description);
    setGitRepoUrl(question.git_repo_url);
    setStartTime(question.start_time);
    setEndTime(question.end_time);
    setIsCreate(false);
    (document.getElementById("create_modal") as HTMLDialogElement)?.showModal();
  };

  return (
    <div className="flex flex-col flex-1 ">
      <div className="flex justify-end mb-4 gap-4">
        <div className="btn btn-primary" onClick={createBtnClick}>
          Create New Question
          <Plus />
        </div>
      </div>
      <PaginationTable<Question>
        classname="table-lg"
        url={`${process.env.NEXT_PUBLIC_API_BASE_URL}/questions`}
        totalField="question_count"
        dataField="questions"
        theadShow={() => (
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
            <th>Modify</th>
            <th>Score</th>
          </tr>
        )}
        tbodyShow={(item, index) => (
          <tr key={index}>
            <td>{item.id}</td>
            <td>{item.title}</td>
            <td>{toSystemDateFormat(new Date(item.start_time))}</td>
            <td>{toSystemDateFormat(new Date(item.end_time))}</td>
            <td>
              <input
                type="checkbox"
                checked={item.is_active}
                className="toggle toggle-primary"
                // onChange={(e) =>
                //   // handleProblemStatusChange(item.id, e.target.checked)
                // }
              />
            </td>
            <td>
              <div
                className="btn btn-ghost btn-sm"
                onClick={() => modifyBtnClick(item)}
              >
                <Pen />
              </div>
            </td>
            <td>
              <div
                className="btn btn-ghost btn-sm"
                onClick={() => router.push(`/admin/questions/${item.id}/score`)}
              >
                <Trophy />
              </div>
            </td>
          </tr>
        )}
      />

      {/* dialog */}
      <dialog id="create_modal" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg">
            {isCreate ? "Create New Question" : "Update Question"}
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
              <label>Gitea Repository URL</label>
              <input
                type="text"
                placeholder="Gitea Repository URL"
                className="input input-bordered w-full"
                value={gitRepoUrl}
                onChange={(e) => setGitRepoUrl(e.target.value)}
              />
            </div>

            <div className="w-full flex flex-col gap-2">
              <label>Start Time</label>
              <DateTimePicker
                value={startTime}
                onChange={(value) => setStartTime(toISOStringFromLocal(value))}
              />
            </div>

            <div className="w-full flex flex-col gap-2">
              <label>End Time</label>
              <DateTimePicker
                value={endTime}
                onChange={(value) => setEndTime(toISOStringFromLocal(value))}
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
