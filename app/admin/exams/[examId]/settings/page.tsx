"use client";

// next.js
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";

// components
import DateTimePicker from "@/components/DatePicker";

// utils
import {
  toDatetimeLocalString,
  toISOStringFromLocal,
} from "@/utils/datetimeUtils";
import { showAlert } from "@/utils/alertUtils";
import { fetchWithRefresh } from "@/utils/fetchUtils";

// icons
import { Pen, Plus, Trash } from "lucide-react";

// type
import type { ApiResponse } from "@/types/api/common";
import PaginationTable from "@/components/PaginationTable";
import { ExamQuestion } from "@/types/api/admin/exam/examQuestion";
import {
  QuestionLimit,
  QuestionScript,
} from "@/types/api/admin/question/question";
import { PublicQuestion } from "@/types/api/question";
import { ParamValue } from "next/dist/server/request/params";
import { NOTFOUND } from "dns";

export default function Setting() {
  return (
    <div className="flex flex-1 flex-row h-full">
      <div className="flex-1 ">
        <ExamInfo />
      </div>

      <div className="divider divider-horizontal"></div>

      <div className="flex-3">
        <QuestionList />
      </div>
    </div>
  );
}

function QuestionList() {
  const params = useParams();
  const id = params.examId;
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(
    null
  );
  const [selectedQuestionPoint, setSelectedQuestionPoint] = useState<
    number | null
  >(null);

  const handleDeleteQuestion = (questionId: number) => {
    if (
      !confirm("Are you sure you want to delete this question from the exam?")
    )
      return;
    fetchWithRefresh(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/exams/admin/${id}/questions/${questionId}/question`,
      {
        method: "DELETE",
        credentials: "include",
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete question");
        }
        return response.json();
      })
      .then((json: ApiResponse<object>) => {
        if (!json.success) {
          throw new Error(json.message);
        }
        return fetchWithRefresh(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/questions/admin/${questionId}/question`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete question");
        }
        return response.json();
      })
      .then((json: ApiResponse<object>) => {
        if (!json.success) {
          throw new Error(json.message);
        }
        showAlert("Question deleted successfully", "success");
      })
      .catch((error) => {
        showAlert(error.message, "error");
      });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-end mb-2">
        <button
          className="btn btn-primary"
          onClick={async () => {
            await setSelectedQuestionId(null);
            await setSelectedQuestionPoint(null);
            openDialog();
          }}
        >
          Create Question
          <Plus />
        </button>
      </div>
      <PaginationTable<ExamQuestion>
        url={`${process.env.NEXT_PUBLIC_API_BASE_URL}/exams/${id}/questions`}
        totalField="question_count"
        dataField="questions"
        theadShow={() => (
          <tr>
            <th>Title</th>
            <th>Git repo URL</th>
            <th>Point</th>
            <th>Modify</th>
            <th>Remove</th>
          </tr>
        )}
        tbodyShow={(question: ExamQuestion, index: number) => (
          <tr key={index}>
            <td>{question.question.title}</td>
            <td>{question.question.git_repo_url}</td>
            <td>{question.point}</td>
            <td>
              <div
                className="btn btn-ghost btn-sm"
                onClick={async () => {
                  await setSelectedQuestionId(question.question.id);
                  await setSelectedQuestionPoint(question.point);
                  openDialog();
                }}
              >
                <Pen />
              </div>
            </td>
            <td>
              <div className="btn btn-ghost btn-sm">
                <Trash
                  color="red"
                  onClick={() => handleDeleteQuestion(question.question.id)}
                />
              </div>
            </td>
          </tr>
        )}
      />
      <CreateAndUpdateQuestionDialog
        examId={id}
        id={selectedQuestionId}
        questionPoint={selectedQuestionPoint}
      />
    </div>
  );
}

function ExamInfo() {
  const params = useParams();
  const id = params.examId;

  // Fetch exam data
  const { data: examData } = useSWR(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/exams/admin/${id}/exam`
  );

  // State for exam details
  const [examTitle, setExamTitle] = useState("");
  const [examDescription, setExamDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Fetch existing exam details
  useEffect(() => {
    if (examData?.data) {
      setExamTitle(examData.data.title);
      setExamDescription(examData.data.description);
      setStartTime(toDatetimeLocalString(examData.data.start_time));
      setEndTime(toDatetimeLocalString(examData.data.end_time));
    }
  }, [examData]);

  const handleUpdateExam = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    fetchWithRefresh(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/exams/admin/${id}/exam`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: examTitle,
          description: examDescription,
          start_time: toISOStringFromLocal(startTime),
          end_time: toISOStringFromLocal(endTime),
        }),
        credentials: "include",
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data: ApiResponse<object>) => {
        if (!data.success) {
          throw new Error(data.message || "Failed to update exam");
        }
        showAlert(data.message || "Exam updated successfully", "success");
      })
      .catch((error) => {
        showAlert(error.message || "Failed to update exam", "error");
      });
  };

  return (
    <form onSubmit={handleUpdateExam}>
      <fieldset>
        <label className="label">Exam Title</label>
        <div>
          <input
            type="text"
            placeholder="Exam Title"
            required
            className="input input-bordered w-full validator"
            value={examTitle}
            onChange={(e) => setExamTitle(e.target.value)}
          />
          <p className="validator-hint">Title is required</p>
        </div>

        <label className="label">Exam Description</label>
        <div>
          <textarea
            className="textarea textarea-bordered w-full validator"
            value={examDescription}
            required
            onChange={(e) => setExamDescription(e.target.value)}
            placeholder="Exam Description"
          />
          <p className="validator-hint">Description is required</p>
        </div>

        <label className="label">Start Time</label>
        <DateTimePicker
          value={startTime}
          onChange={(value) => setStartTime(toISOStringFromLocal(value))}
          requiredHint="Start time is required"
        />

        <label className="label">End Time</label>
        <DateTimePicker
          value={endTime}
          onChange={(value) => setEndTime(toISOStringFromLocal(value))}
          requiredHint="End time is required"
        />
      </fieldset>
      <div className="flex justify-end">
        <button className="btn btn-primary" type="submit">
          Save Changes
        </button>
      </div>
    </form>
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

function CreateAndUpdateQuestionDialog({
  examId,
  id,
  questionPoint,
}: {
  examId: ParamValue;
  id: number | null;
  questionPoint?: number | null;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [gitRepoUrl, setGitRepoUrl] = useState<string>("");
  const [point, setPoint] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(false);

  const [compileScript, setCompileScript] = useState<string>("");
  const [executeScript, setExecuteScript] = useState<string>("");
  const [scoreScript, setScoreScript] = useState<string>("");
  const [scoreMap, setScoreMap] = useState<string>("");

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
          is_active: isActive,
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
      .then((json: ApiResponse<PublicQuestion>) => {
        if (!json.success) throw new Error(json.message);

        return fetchWithRefresh(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/exams/admin/${examId}/questions/${json.data.id}/question`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              accept: "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              score: Number(point),
            }),
          }
        );
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to add question to exam");
        }
        return response.json();
      })
      .then((json) => {
        if (json.success === false) throw new Error(json.message);
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
          is_active: isActive,
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
        return fetchWithRefresh(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/exams/admin/${examId}/questions/${id}/question`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to remove question from exam");
        }
        return fetchWithRefresh(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/exams/admin/${examId}/questions/${id}/question`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              accept: "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              score: Number(point),
            }),
          }
        );
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to add question to exam");
        }
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
    setIsActive(false);
    setPoint("");

    setCompileScript("");
    setExecuteScript("");
    setScoreScript("");
    setScoreMap("");

    setTimeLimit("");
    setWallTimeLimit("");

    setMemoryLimit("");
    setStackMemoryLimit("");
    setFileSizeLimit("");
    setProcessNumberLimit("");
    setOpenFilesLimit("");
  };
  async function refreshQuestion() {
    if (id === null) return;
    fetchWithRefresh(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/questions/${id}/question`,
      {
        method: "GET",
        credentials: "include",
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch question");
        }
        return response.json();
      })
      .then((json) => {
        if (json.success === false) throw new Error(json.message);
        setTitle(json.data.title);
        setDescription(json.data.description);
        setGitRepoUrl(json.data.git_repo_url);
      })
      .catch((error) => {
        showAlert("Failed to fetch question:" + error.message, "error");
      });
  }

  async function refreshScript() {
    if (id === null) return;
    fetchWithRefresh(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/questions/admin/${id}/scripts`,
      {
        method: "GET",
        credentials: "include",
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch scripts");
        }
        return response.json();
      })
      .then((json) => {
        if (json.success === false) throw new Error(json.message);
        setCompileScript(json.data.compile_script);
        setExecuteScript(json.data.execute_script);
        setScoreScript(json.data.score_script);
        setScoreMap(json.data.score_map);
      })
      .catch((error) => {
        showAlert("Failed to fetch scripts:" + error.message, "error");
      });
  }

  async function refreshLimit() {
    if (id === null) return;
    fetchWithRefresh(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/questions/admin/${id}/question_limit`,
      {
        method: "GET",
        credentials: "include",
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch question limit");
        }
        return response.json();
      })
      .then((json) => {
        if (json.success === false) throw new Error(json.message);
        setMemoryLimit(String(json.data.memory));
        setStackMemoryLimit(String(json.data.stack_memory));
        setTimeLimit(String(json.data.time));
        setWallTimeLimit(String(json.data.wall_time));
        setFileSizeLimit(String(json.data.file_size));
        setProcessNumberLimit(String(json.data.processes));
        setOpenFilesLimit(String(json.data.open_files));
      })
      .catch((error) => {
        showAlert("Failed to fetch question limit:" + error.message, "error");
      });
  }

  return (
    <dialog
      id="create_question_modal"
      className="modal"
      onBeforeToggle={(e) => {
        if (e.newState === "closed") {
          clearForm();
        } else if (e.newState === "open" && id !== null) {
          refreshLimit();
          refreshScript();
          refreshQuestion();
          setPoint(questionPoint ? String(questionPoint) : "");
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

            <label className="label">Point</label>
            <div>
              <input
                type="number"
                placeholder="Point"
                required
                className="input input-bordered w-full validator"
                value={point}
                onChange={(e) => setPoint(e.target.value)}
              />
              <p className="validator-hint">Point is required</p>
            </div>

            <label className="label">Is Active</label>
            <div>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
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
