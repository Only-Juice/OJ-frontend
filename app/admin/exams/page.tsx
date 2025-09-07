"use client";

// next.js
import useSWR from "swr";
import Link from "next/link";
import { useState, useRef } from "react";

// components
import Breadcrumbs from "@/components/Breadcrumbs";
import DateTimePicker from "@/components/DatePicker";

// utils
import {
  toISOStringFromLocal,
  toSystemDateFormat,
} from "@/utils/datetimeUtils";
import { fetchWithRefresh } from "@/utils/fetchUtils";

// icons
import { Plus, Settings } from "lucide-react";

// type
import type { Exam } from "@/types/api/common";

export default function Exam() {
  const links = [{ title: "Exams", href: "/admin/exams" }];

  const { data: examsData, mutate: mutateExams } = useSWR(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/exams`
  );

  return (
    <div className="flex-1">
      <Breadcrumbs links={links} />
      <div className="fixed bottom-4 right-4">
        <div
          className="btn btn-primary"
          onClick={() =>
            (
              document.getElementById("create_modal") as HTMLDialogElement
            )?.showModal()
          }
        >
          Create exam
          <Plus />
        </div>
      </div>
      {examsData ? (
        <ExamCards exams={examsData.data} mutateExams={mutateExams} />
      ) : (
        <p>Loading...</p>
      )}
      <ExamDialog mutateExams={mutateExams} />
    </div>
  );
}

function ExamCards({
  exams,
  mutateExams,
}: {
  exams: Exam[];
  mutateExams: () => void;
}) {
  // Function to handle exam deletion
  const handleDeleteExam = async (examId: number) => {
    if (!confirm("Are you sure you want to delete this exam?")) return;

    try {
      const response = await fetchWithRefresh(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/exams/admin/${examId}/exam`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete exam");
      }

      alert("Exam deleted successfully!");
      mutateExams(); // Refresh the exam list
    } catch (error) {
      console.error("Error deleting exam:", error);
    }
  };

  return (
    <div className="flex flex-1 flex-wrap gap-8">
      {exams.map((exam: Exam) => (
        <div className="card bg-base-100 w-96 shadow-sm" key={exam.id}>
          <div className="card-body">
            <h2 className="card-title">
              {exam.title}
              <div className="m-auto"></div>
              <details className="dropdown dropdown-end">
                <summary className="btn btn-ghost btn-sm m-1">
                  <Settings />
                </summary>
                <ul className="menu dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm border border-base-300">
                  <li>
                    <Link href={`/admin/exams/${exam.id}/settings`}>
                      Setting
                    </Link>
                  </li>
                  <li>
                    <button
                      className="text-error"
                      onClick={() => handleDeleteExam(exam.id)}
                    >
                      Delete
                    </button>
                  </li>
                </ul>
              </details>
            </h2>
            <p>Start from: {toSystemDateFormat(new Date(exam.start_time))}</p>
            <p>End at: {toSystemDateFormat(new Date(exam.end_time))}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ExamDialog({ mutateExams }: { mutateExams: () => void }) {
  const [examTitle, setExamTitle] = useState("");
  const [examDescription, setExamDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const createFormRef = useRef<HTMLFormElement>(null);

  const clearForm = () => {
    setExamTitle("");
    setExamDescription("");
    setStartTime("");
    setEndTime("");

    createFormRef.current?.reset();
  };

  // Function to handle exam deletion
  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();

    const examData = {
      title: examTitle,
      description: examDescription,
      start_time: toISOStringFromLocal(startTime),
      end_time: toISOStringFromLocal(endTime),
    };

    try {
      const response = await fetchWithRefresh(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/exams/admin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(examData),
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create exam");
      }

      alert("Exam created successfully!");
      // Reset form after successful creation

      clearForm();

      mutateExams(); // Refresh the exam list
      (document.getElementById("create_modal") as HTMLDialogElement)?.close();
    } catch (error) {}
  };

  return (
    <dialog id="create_modal" className="modal">
      <div className="modal-box">
        <form method="dialog">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={clearForm}
          >
            ✕
          </button>
        </form>
        <form onSubmit={handleCreateExam} ref={createFormRef}>
          <fieldset className="fieldset">
            <legend className="text-lg font-bold mb-4">Create New Exam</legend>

            <label className="label">Title</label>
            <div>
              <input
                className="input input-bordered w-full validator"
                required
                type="text"
                placeholder="Title"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
              />
              <p className="validator-hint">Title is required</p>
            </div>

            <label className="label">Description</label>
            <div>
              <textarea
                className="textarea textarea-bordered w-full validator"
                required
                placeholder="Description"
                value={examDescription}
                onChange={(e) => setExamDescription(e.target.value)}
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

            <button className="btn btn-primary w-full mt-8" type="submit">
              Create
            </button>
          </fieldset>
        </form>
      </div>
    </dialog>
  );
}
