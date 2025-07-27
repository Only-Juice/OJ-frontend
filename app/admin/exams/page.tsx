"use client";

// next.js
import useSWR from "swr";
import Link from "next/link";
import { useState } from "react";

// components
import Breadcrumbs from "@/components/Breadcrumbs";

// utils
import {
  toDatetimeLocal,
  toLocalISOString,
  toSystemDateFormat,
} from "@/utils/datetimeUtils";

// icons
import { Plus, Settings } from "lucide-react";

export default function Exam() {
  const links = [{ title: "Exams", href: "/admin/exams" }];

  const { data: examsData, mutate: mutateExams } = useSWR(
    "https://ojapi.ruien.me/api/exams"
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
      start_time: toLocalISOString(startTime),
      end_time: toLocalISOString(endTime),
    };

    try {
      const response = await fetch(
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
      document.getElementById("create_modal")?.close();
    } catch (error) {}
  };

  // Function to handle exam deletion
  const handleDeleteExam = async (examId) => {
    if (!confirm("Are you sure you want to delete this exam?")) return;

    try {
      const response = await fetch(
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
          onClick={() => document.getElementById("create_modal")?.showModal()}
        >
          Create exam
          <Plus />
        </div>
      </div>
      <div className="flex flex-1 flex-wrap gap-8">
        {examsData?.data?.map((exam) => (
          <div className="card bg-base-100 w-96 shadow-sm" key={exam.id}>
            <div className="card-body">
              <h2 className="card-title">
                {exam.title}
                <div className="m-auto"></div>
                <Link href={`/admin/exams/${exam.id}/settings`}>
                  <button className="btn btn-ghost btn-sm">
                    <Settings />
                  </button>
                </Link>
              </h2>
              <p>Start from: {toSystemDateFormat(new Date(exam.start_time))}</p>
              <p>End at: {toSystemDateFormat(new Date(exam.end_time))}</p>
              <div className="card-actions justify-end">
                <button
                  className="btn btn-error"
                  onClick={() => handleDeleteExam(exam.id)}
                >
                  Delete
                </button>
              </div>
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
