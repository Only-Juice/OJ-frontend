"use client";

// next.js
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useEffect } from "react";

// components
import PaginationTable from "@/components/PaginationTable";
import DateTimePicker from "@/components/DatePicker";

// utils
import {
  toISOStringFromLocal,
  toSystemDateFormat,
} from "@/utils/datetimeUtils";
import { fetchWithRefresh } from "@/utils/fetchUtils";
import { showAlert } from "@/utils/alertUtils";

// icons
import { Plus, Pen, Trophy } from "lucide-react";

// types
import { ApiResponse, Question } from "@/types/api/common";
import { PublicQuestion } from "@/types/api/question";
import {
  QuestionLimit,
  QuestionScript,
} from "@/types/api/admin/question/question";

export default function Questions() {
  const router = useRouter();
  const [id, setId] = useState<number | null>(null);

  const handleProblemStatusChange = (id: number, isActive: boolean) => {
    fetchWithRefresh(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/questions/admin/${id}/question`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ is_active: isActive }),
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update question status");
        }
        return response.json();
      })
      .then((json: ApiResponse<object>) => {
        if (!json.success) throw new Error(json.message);
        showAlert("Question status updated successfully", "success");
      })
      .catch((error) => {
        showAlert("Failed to update question status:" + error.message, "error");
      });
  };

  return (
    <div className="flex flex-col flex-1 max-h-full">
      <div className="flex justify-end mb-4 gap-4">
        <div
          className="btn btn-primary"
          onClick={() => {
            setId(null);
            openDialog();
          }}
        >
          Create New Question
          <Plus />
        </div>
      </div>
      <PaginationTable<Question>
        classname="table-lg table-auto"
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
                onChange={(e) =>
                  handleProblemStatusChange(item.id, e.target.checked)
                }
              />
            </td>
            <td>
              <div
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setId(item.id);
                  openDialog();
                }}
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

      <CreateAndUpdateQuestinoDialog id={id} />
    </div>
  );
}

function openDialog() {
  (
    document.getElementById("create_question_modal") as HTMLDialogElement
  )?.showModal();
}

function closeDialog() {
  (
    document.getElementById("create_question_modal") as HTMLDialogElement
  )?.close();
}

function CreateAndUpdateQuestinoDialog({ id }: { id: number | null }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [gitRepoUrl, setGitRepoUrl] = useState<string>("");

  const [compileScript, setCompileScript] = useState<string>("");
  const [executeScript, setExecuteScript] = useState<string>("");
  const [scoreScript, setScoreScript] = useState<string>("");
  const [scoreMap, setScoreMap] = useState<string>("");

  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [timeLimit, setTimeLimit] = useState<string>("");
  const [wallTimeLimit, setWallTimeLimit] = useState<string>("");

  const [memoryLimit, setMemoryLimit] = useState<string>("");
  const [stackMemoryLimit, setStackMemoryLimit] = useState<string>("");
  const [fileSizeLimit, setFileSizeLimit] = useState<string>("");
  const [processNumberLimit, setProcessNumberLimit] = useState<string>("");
  const [openFilesLimit, setOpenFilesLimit] = useState<string>("");

  const isCreate = id === null;

  const handleCreate = () => {
    fetchWithRefresh(
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
          compile_script: compileScript,
          execute_script: executeScript,
          score_script: scoreScript,
          score_map: scoreMap,
          time: Number(timeLimit),
          wall_time: Number(wallTimeLimit),
          memory: Number(memoryLimit),
          stack_memory: Number(stackMemoryLimit),
          file_size: Number(fileSizeLimit),
          processes: Number(processNumberLimit),
          open_files: Number(openFilesLimit),
        }),
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to create question");
        }
        return response.json();
      })
      .then((json: ApiResponse<object>) => {
        if (!json.success) throw new Error(json.message);
        closeDialog();
        showAlert("Question created successfully", "success");
      })
      .catch((error) => {
        showAlert("Failed to create question:" + error.message, "error");
      });
  };

  const handleUpdate = () => {
    fetchWithRefresh(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/questions/admin/${id}/question`,
      {
        method: "PATCH",
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
          compile_script: compileScript,
          execute_script: executeScript,
          score_script: scoreScript,
          score_map: scoreMap,
          time: Number(timeLimit),
          wall_time: Number(wallTimeLimit),
          memory: Number(memoryLimit),
          stack_memory: Number(stackMemoryLimit),
          file_size: Number(fileSizeLimit),
          processes: Number(processNumberLimit),
          open_files: Number(openFilesLimit),
        }),
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update question");
        }
        return response.json();
      })
      .then((json) => {
        if (json.success === false) throw new Error(json.message);
        closeDialog();
        showAlert("Question updated successfully", "success");
      })
      .catch((error) => {
        showAlert("Failed to update question:" + error.message, "error");
      });
  };

  const clearForm = () => {
    formRef.current?.reset();
    setTitle("");
    setDescription("");
    setGitRepoUrl("");

    setCompileScript("");
    setExecuteScript("");
    setScoreScript("");
    setScoreMap("");

    setStartTime("");
    setEndTime("");
    setTimeLimit("");
    setWallTimeLimit("");

    setMemoryLimit("");
    setStackMemoryLimit("");
    setFileSizeLimit("");
    setProcessNumberLimit("");
    setOpenFilesLimit("");
  };

  const { data: question, mutate: mutateQuestion } = useSWR<
    ApiResponse<PublicQuestion>
  >(
    id === null
      ? null
      : `${process.env.NEXT_PUBLIC_API_BASE_URL}/questions/${id}/question`
  );

  useEffect(() => {
    if (question && question.success && question.data) {
      setTitle(question.data.title);
      setDescription(question.data.description);
      setGitRepoUrl(question.data.git_repo_url);
      setStartTime(question.data.start_time);
      setEndTime(question.data.end_time);
    }
  }, [question]);

  const { data: script, mutate: mutateScript } = useSWR<
    ApiResponse<QuestionScript>
  >(
    id === null
      ? null
      : `${process.env.NEXT_PUBLIC_API_BASE_URL}/questions/admin/${id}/scripts`
  );

  useEffect(() => {
    if (script && script.success && script.data) {
      setCompileScript(script.data.compile_script);
      setExecuteScript(script.data.execute_script);
      setScoreScript(script.data.score_script);
      setScoreMap(script.data.score_map);
    }
  }, [script]);

  const { data: limit, mutate: mutateLimit } = useSWR<
    ApiResponse<QuestionLimit>
  >(
    id === null
      ? null
      : `${process.env.NEXT_PUBLIC_API_BASE_URL}/questions/admin/${id}/question_limit`
  );

  useEffect(() => {
    if (limit && limit.success && limit.data) {
      setMemoryLimit(String(limit.data.memory));
      setStackMemoryLimit(String(limit.data.stack_memory));
      setTimeLimit(String(limit.data.time));
      setWallTimeLimit(String(limit.data.wall_time));
      setFileSizeLimit(String(limit.data.file_size));
      setProcessNumberLimit(String(limit.data.processes));
      setOpenFilesLimit(String(limit.data.open_files));
    }
  }, [limit]);

  return (
    <dialog
      id="create_question_modal"
      className="modal"
      onBeforeToggle={(e) => {
        console.log(e);

        if (e.newState === "closed") {
          clearForm();
        } else if (e.newState === "open" && id !== null) {
          mutateQuestion();
          mutateScript();
          mutateLimit();
        }
      }}
    >
      <div className="modal-box">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>
        <h3 className="font-bold text-lg">
          {isCreate ? "Create New Question" : "Update Question"}
        </h3>
        <form
          className="flex flex-col"
          ref={formRef}
          onSubmit={(e) => {
            e.preventDefault();
            if (isCreate) {
              handleCreate();
            } else {
              // update
              handleUpdate();
            }
          }}
        >
          <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4 ">
            <legend className="fieldset-legend">Basic Informations</legend>
            <label className="label">Title</label>
            <div>
              <input
                type="text"
                placeholder="Title"
                required
                className="input input-bordered w-full validator"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <p className="validator-hint">Title is required</p>
            </div>

            <label className="label">Description</label>
            <div>
              <textarea
                className="textarea textarea-bordered w-full validator"
                placeholder="Description"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
              <p className="validator-hint">Description is required</p>
            </div>

            <label className="label">Gitea Repository URL</label>
            <div>
              <input
                type="text"
                placeholder="Gitea Repository URL"
                className="input input-bordered w-full validator"
                value={gitRepoUrl}
                required
                onChange={(e) => setGitRepoUrl(e.target.value)}
              />
              <p className="validator-hint">Gitea Repository URL is required</p>
            </div>
          </fieldset>
          <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4 ">
            <legend className="fieldset-legend">Execution Scripts</legend>
            <label className="label">Compile Script</label>
            <div>
              <textarea
                className="textarea textarea-bordered w-full validator"
                placeholder="Compile Script"
                required
                value={compileScript}
                onChange={(e) => setCompileScript(e.target.value)}
              ></textarea>
              <p className="validator-hint">Compile Script is required</p>
            </div>

            <label className="label">Execute Script</label>
            <div>
              <textarea
                className="textarea textarea-bordered w-full validator"
                placeholder="Execute Script"
                required
                value={executeScript}
                onChange={(e) => setExecuteScript(e.target.value)}
              ></textarea>
              <p className="validator-hint">Execute Script is required</p>
            </div>

            <label className="label">Score Script</label>
            <div>
              <textarea
                className="textarea textarea-bordered w-full validator"
                placeholder="Score Script"
                required
                value={scoreScript}
                onChange={(e) => setScoreScript(e.target.value)}
              ></textarea>
              <p className="validator-hint">Score Script is required</p>
            </div>

            <label className="label">Score Map</label>
            <div>
              <textarea
                className="textarea textarea-bordered w-full validator"
                placeholder="Score Map"
                required
                value={scoreMap}
                onChange={(e) => setScoreMap(e.target.value)}
              ></textarea>
              <p className="validator-hint">Test Script is required</p>
            </div>
          </fieldset>
          <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4 ">
            <legend className="fieldset-legend">Time Settings</legend>

            <label className="label">Start Time</label>
            <div>
              <DateTimePicker
                value={startTime}
                onChange={(value) => setStartTime(toISOStringFromLocal(value))}
                requiredHint="Start Time is required"
              />
            </div>

            <label className="label">End Time</label>
            <div>
              <DateTimePicker
                value={endTime}
                onChange={(value) => setEndTime(toISOStringFromLocal(value))}
                requiredHint="End Time is required"
              />
            </div>
            <label className="label">Time Limit (ms)</label>
            <div>
              <input
                type="number"
                placeholder="Time Limit (ms)"
                required
                className="input input-bordered w-full validator"
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
              />
              <p className="validator-hint">Time limit is required</p>
            </div>

            <label className="label">Wall Time Limit (ms)</label>
            <div>
              <input
                type="number"
                placeholder="Wall Time Limit (ms)"
                required
                className="input input-bordered w-full validator"
                value={wallTimeLimit}
                onChange={(e) => setWallTimeLimit(e.target.value)}
              />
              <p className="validator-hint">Wall time limit is required</p>
            </div>
          </fieldset>
          <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4 ">
            <legend className="fieldset-legend">Resource Limits</legend>
            <label className="label">Memory Limit (kB)</label>
            <div>
              <input
                type="number"
                placeholder="Memory Limit (kB)"
                required
                className="input input-bordered w-full validator"
                value={memoryLimit}
                onChange={(e) => setMemoryLimit(e.target.value)}
              />
              <p className="validator-hint">Memory limit is required</p>
            </div>

            <label className="label">Stack Memory Limit (kB)</label>
            <div>
              <input
                type="number"
                placeholder="Stack Memory Limit (kB)"
                required
                className="input input-bordered w-full validator"
                value={stackMemoryLimit}
                onChange={(e) => setStackMemoryLimit(e.target.value)}
              />
              <p className="validator-hint">Stack memory limit is required</p>
            </div>

            <label className="label">File Size Limit (kB)</label>
            <div>
              <input
                type="number"
                placeholder="File Size Limit (kB)"
                required
                className="input input-bordered w-full validator"
                value={fileSizeLimit}
                onChange={(e) => setFileSizeLimit(e.target.value)}
              />
              <p className="validator-hint">File size limit is required</p>
            </div>

            <label className="label">Process Number Limit</label>
            <div>
              <input
                type="number"
                placeholder="Process Number Limit"
                required
                className="input input-bordered w-full validator"
                value={processNumberLimit}
                onChange={(e) => setProcessNumberLimit(e.target.value)}
              />
              <p className="validator-hint">Process number limit is required</p>
            </div>

            <label className="label">Open File Limit</label>
            <div>
              <input
                type="number"
                placeholder="Open File Limit"
                required
                className="input input-bordered w-full validator"
                value={openFilesLimit}
                onChange={(e) => setOpenFilesLimit(e.target.value)}
              />
              <p className="validator-hint">Open file limit is required</p>
            </div>
          </fieldset>

          <div className="flex flex-col items-center mt-5">
            {isCreate ? (
              <button className="btn btn-primary w-full">Create</button>
            ) : (
              <button className="btn btn-primary w-full">Update</button>
            )}
          </div>
        </form>
      </div>
    </dialog>
  );
}
