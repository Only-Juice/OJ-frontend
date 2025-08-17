"use client";

// next.js
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";

// components
import Breadcrumbs from "@/components/Breadcrumbs";
import DateTimePicker from "@/components/DatePicker";

// utils
import {
  toDatetimeLocalString,
  toISOStringFromLocal,
} from "@/utils/datetimeUtils";

// icons
import { Trash } from "lucide-react";
import { fetchWithRefresh } from "@/utils/apiUtils";

// type
import type { ExamQuestionInAdmin } from "@/types/api";

type operate = "delete" | "update" | "create";

type Question = {
  id: number;
  title: string;
  git_repo_url: string;
  description: string;
  startTime: string;
  endTime: string;
  isInDb: boolean;
  operate: operate;
};

export default function Create() {
  const params = useParams();
  const id = params.examId;

  // Fetch exam data
  const { data: examData } = useSWR(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/exams/admin/${id}/exam`
  );

  // Breadcrumbs links
  const links = [
    { title: "Exams", href: "/admin/exams" },
    {
      title: `Exam ${examData?.data?.title}`,
      href: `/admin/exams/${id}/settings`,
    },
  ];

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

  // State for questions
  const [questions, setQuestions] = useState<Question[]>([]);

  // Fetch existing questions
  const { data: questionsData } = useSWR(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/exams/${id}/questions`
  );

  // Fetch existing questions
  useEffect(() => {
    if (questionsData?.data) {
      setQuestions(
        questionsData.data.questions.map((question: ExamQuestionInAdmin) => {
          return {
            ...question.question,
            startTime: "",
            endTime: "",
            isInDb: true,
            operate: "update",
          };
        })
      );
    }
  }, [questionsData]);

  // Function to add a new question row
  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: 0,
        title: "",
        git_repo_url: "",
        description: "",
        startTime: "",
        endTime: "",
        isInDb: false,
        operate: "create",
      },
    ]);
  };

  // Function to handle changes in question fields
  const handleQuestionChange = (
    index: number,
    field: "title" | "git_repo_url" | "description",
    value: string
  ) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  // Function to remove a question row
  const handleRemoveQuestion = (index: number) => {
    if (questions[index].isInDb) {
      // If the question is in the database, mark it for deletion
      const updated = [...questions];
      updated[index].operate = "delete";
      setQuestions(updated);
    } else {
      // If the question is not in the database, remove it from the state
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  // Function to handle exam update
  const handleUpdateExam = async () => {
    const updatedExam = {
      title: examTitle,
      description: examDescription,
      start_time: toISOStringFromLocal(startTime),
      end_time: toISOStringFromLocal(endTime),
    };

    // Make API call to update exam
    fetchWithRefresh(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/exams/admin/${id}/exam`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedExam),
        credentials: "include",
      }
    ).then((response) => {
      if (response.ok) {
        handleUpdateQuestions();
      }
    });
  };

  const handleUpdateQuestions = async () => {
    questions.forEach(async (question) => {
      if (question.operate === "create") {
        // Create new question
        fetchWithRefresh(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/questions/admin/question`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: question.title,
              git_repo_url: question.git_repo_url,
              description: question.description,
              start_time: toISOStringFromLocal(startTime),
              end_time: toISOStringFromLocal(endTime),
            }),
            credentials: "include",
          }
        )
          .then((response) => {
            if (!response.ok) {
              throw new Error("Failed to create question");
            }
            return response.json();
          })
          .then((data) => {
            fetchWithRefresh(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/exams/admin/${id}/questions/${data.data.id}/question`,
              {
                method: "POST",
                credentials: "include",
              }
            );
            console.log("Question created successfully:", data);
          });
      } else if (question.operate === "update") {
        // Update existing question
        await fetchWithRefresh(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/questions/admin/${question.id}/question`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: question.title,
              git_repo_url: question.git_repo_url,
              description: question.description,
              start_time: toISOStringFromLocal(startTime),
              end_time: toISOStringFromLocal(endTime),
            }),
            credentials: "include",
          }
        );
      } else if (question.operate === "delete") {
        // Delete existing question
        fetchWithRefresh(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/exams/admin/${id}/questions/${question.id}/question`,
          {
            method: "DELETE",
            credentials: "include",
          }
        ).then((response) => {
          if (response.ok) {
            fetchWithRefresh(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/questions/admin/${question.id}/question`,
              {
                method: "DELETE",
                credentials: "include",
              }
            );
          }
        });
      }
    });
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
            <DateTimePicker
              value={startTime}
              onChange={(value) => setStartTime(toISOStringFromLocal(value))}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label>End Time</label>
            <DateTimePicker
              value={endTime}
              onChange={(value) => setEndTime(toISOStringFromLocal(value))}
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
              {questions.map(
                (question, index) =>
                  question.operate !== "delete" && (
                    <tr key={index}>
                      <td className="align-top">
                        <input
                          type="text"
                          className="input input-bordered w-full"
                          value={question.title}
                          onChange={(e) =>
                            handleQuestionChange(index, "title", e.target.value)
                          }
                          placeholder="Question Title"
                        />
                      </td>
                      <td className="align-top">
                        <input
                          type="text"
                          className="input input-bordered w-full"
                          value={question.git_repo_url}
                          onChange={(e) =>
                            handleQuestionChange(
                              index,
                              "git_repo_url",
                              e.target.value
                            )
                          }
                          placeholder="Git repo URL"
                        />
                      </td>
                      <td className="align-top">
                        <textarea
                          className="textarea textarea-bordered w-full"
                          value={question.description}
                          onChange={(e) =>
                            handleQuestionChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Question Description"
                        />
                      </td>

                      <td className="align-top">
                        <div
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleRemoveQuestion(index)}
                        >
                          <Trash />
                        </div>
                      </td>
                    </tr>
                  )
              )}
            </tbody>
          </table>

          <button
            className="btn btn-primary w-full mt-2"
            onClick={handleAddQuestion}
          >
            Add Question
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
