"use client";

// next.js
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";

// components
import Breadcrumbs from "@/components/Breadcrumbs";

// utils
import { toDatetimeLocal, toLocalISOString } from "@/utils/datetimeUtils";

// icons
import { Trash } from "lucide-react";

export default function Create() {
  const params = useParams();
  const id = params.examId;

  // Breadcrumbs links
  const links = [
    { title: "Exams", href: "/admin/exams" },
    { title: `Exam ${id}`, href: `/admin/exams/${id}/settings` },
  ];

  // State for exam details
  const [examTitle, setExamTitle] = useState("");
  const [examDescription, setExamDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Fetch exam data
  const { data: examData } = useSWR(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/exams/admin/${id}/exam`
  );

  // Fetch existing exam details
  useEffect(() => {
    if (examData?.data) {
      setExamTitle(examData.data.title);
      setExamDescription(examData.data.description);
      setStartTime(toDatetimeLocal(examData.data.start_time));
      setEndTime(toDatetimeLocal(examData.data.end_time));
    }
  }, [examData]);

  // State for problems
  const [problems, setProblems] = useState<
    { title: string; gitRepoUrl: string; description: string }[]
  >([]);

  // Function to handle exam deletion
  const { data: problemsData } = useSWR(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/exams/${id}/questions`
  );

  // Fetch existing problems
  useEffect(() => {
    if (problemsData?.data) {
      setProblems(
        problemsData.data.map((problem: any) => ({
          title: problem.title,
          gitRepoUrl: problem.git_repo_url,
          description: problem.description,
        }))
      );
    }
  }, [problemsData]);

  // Function to add a new problem row
  const handleAddProblem = () => {
    setProblems([
      ...problems,
      {
        title: "",
        gitRepoUrl: "",
        description: "",
      },
    ]);
  };

  // Function to handle changes in problem fields
  const handleProblemChange = (
    index: number,
    field: "title" | "gitRepoUrl" | "description",
    value: string
  ) => {
    const updated = [...problems];
    updated[index][field] = value;
    setProblems(updated);
  };

  // Function to remove a problem row
  const handleRemoveProblem = (index: number) => {
    setProblems(problems.filter((_, i) => i !== index));
  };

  // Function to handle exam update
  const handleUpdateExam = async () => {
    const updatedExam = {
      title: examTitle,
      description: examDescription,
      start_time: toLocalISOString(startTime),
      end_time: toLocalISOString(endTime),
      problems,
    };

    // Make API call to update exam
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/exams/admin/${id}/exam`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedExam),
        credentials: "include",
      }
    );

    if (response.ok) {
      alert("Exam updated successfully!");
    } else {
      alert("Failed to update exam.");
    }
  };

  return (
    <div className="flex flex-1 flex-col h-full">
      <Breadcrumbs links={links} />
      <div className="flex-1 flex flex-row gap-4">
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label>Exam Title</label>
            <input
              type="text"
              placeholder="Exam Title"
              className="input input-bordered w-full"
              value={examTitle}
              onChange={(e) => setExamTitle(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label>Exam Description</label>
            <textarea
              className="textarea textarea-bordered w-full"
              value={examDescription}
              onChange={(e) => setExamDescription(e.target.value)}
              placeholder="Exam Description"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label>Start Time</label>
            <input
              type="datetime-local"
              className="input input-bordered w-full"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label>End Time</label>
            <input
              type="datetime-local"
              className="input input-bordered w-full"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>

        <div className="divider divider-horizontal"></div>

        <div className="flex-2">
          {/* TODO: 多一個按鈕可以切換顯示模式和顯示模式 */}
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Git repo URL</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {problems.map((problem, index) => (
                <tr key={index}>
                  <td className="align-top">
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      value={problem.title}
                      onChange={(e) =>
                        handleProblemChange(index, "title", e.target.value)
                      }
                      placeholder="Problem Title"
                    />
                  </td>
                  <td className="align-top">
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      value={problem.gitRepoUrl}
                      onChange={(e) =>
                        handleProblemChange(index, "gitRepoUrl", e.target.value)
                      }
                      placeholder="Git repo URL"
                    />
                  </td>
                  <td className="align-top">
                    <textarea
                      className="textarea textarea-bordered w-full"
                      value={problem.description}
                      onChange={(e) =>
                        handleProblemChange(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      placeholder="Problem Description"
                    />
                  </td>

                  <td className="align-top">
                    <div
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleRemoveProblem(index)}
                    >
                      <Trash />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            className="btn btn-primary w-full mt-2"
            onClick={handleAddProblem}
          >
            Add Problem
          </button>
        </div>
      </div>

      <button
        className="btn btn-primary fixed bottom-4 right-4"
        onClick={() => {
          handleUpdateExam();
        }}
      >
        Save
      </button>
    </div>
  );
}
