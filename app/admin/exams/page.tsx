"use client";

// next.js
import useSWR from "swr";
import Link from "next/link";
import { useState } from "react";

// components
import Breadcrumbs from "@/components/Breadcrumbs";
import DateTimePicker from "@/components/DatePicker";

// utils
import {
  toISOStringFromLocal,
  toSystemDateFormat,
} from "@/utils/datetimeUtils";
import { fetchWithRefresh } from "@/utils/apiUtils";

// icons
import { Plus, Settings } from "lucide-react";

// type
import type { Exam } from "@/types/api";

export default function Exam() {
  const links = [{ title: "Exams", href: "/admin/exams" }];

  const { data: examsData, mutate: mutateExams } = useSWR(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/exams`
  );

  const [examTitle, setExamTitle] = useState("");
  const [examDescription, setExamDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Function to handle exam deletion
  const handleCreateExam = async () => {
    // Validate exam details
    if (!examTitle || !examDescription || !startTime || !endTime) {
      alert("Please fill in all exam fields");
      return;
    }

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
      setExamTitle("");
      setExamDescription("");
      setStartTime("");
      setEndTime("");
      mutateExams(); // Refresh the exam list
      (document.getElementById("create_modal") as HTMLDialogElement)?.close();
    } catch (error) {}
  };

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
      <div className="flex flex-1 flex-wrap gap-8">
        {examsData?.data?.map((exam: Exam) => (
          <div className="card bg-base-100 w-96 shadow-sm" key={exam.id}>
            <div className="card-body">
              <h2 className="card-title">
                {exam.title}
                <div className="m-auto"></div>
                <details className="dropdown dropdown-end">
                  <summary className="btn btn-ghost btn-sm m-1">
                    <Settings />
                  </summary>
                  <ul className="menu dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
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
      <dialog id="create_modal" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg">Create exam</h3>
          <div className="flex flex-col items-center gap-6 max-w-xl mx-auto mt-5">
            <div className="w-full flex flex-col gap-2">
              <label>Title</label>
              <input
                type="text"
                placeholder="Title"
                className="input input-bordered w-full"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
              />
            </div>

            <div className="w-full flex flex-col gap-2">
              <label>Description</label>
              <textarea
                className="textarea textarea-bordered w-full"
                placeholder="Description"
                value={examDescription}
                onChange={(e) => setExamDescription(e.target.value)}
              ></textarea>
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
            <button
              className="btn btn-primary w-full"
              onClick={handleCreateExam}
            >
              Create
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
