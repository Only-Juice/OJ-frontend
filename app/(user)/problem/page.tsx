"use client";

import Breadcrumbs from "@/components/Breadcrumbs";
import ProblemsTable from "@/components/UserProblemsTable";
import useSWR from "swr";

export default function Problem() {
  const links = [{ title: "Problems", href: "/problem" }];
  const { data: questionData } = useSWR(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/question`
  );

  const questions =
    (questionData?.data?.questions || []).map((question: any) => {
      return {
        id: question.id,
        title: question.title,
        startTime: question.start_time,
        endTime: question.end_time,
        status: false,
        has_question: question.has_question,
      };
    }) || [];

  return (
    <div className="flex-1">
      <Breadcrumbs links={links}></Breadcrumbs>
      <div className="w-full flex justify-center gap-10 flex-1">
        <div className="flex-3">
          <ProblemsTable data={questions}></ProblemsTable>
        </div>
        {/* <div className="flex-1">
          <ProblemProgress></ProblemProgress>
        </div> */}
      </div>
    </div>
  );
}

function ProblemProgress() {
  return (
    <div className="card card-dash bg-base-100">
      <div className="card-body flex justify-center items-center">
        <div
          className="radial-progress bg-primary text-primary-content border-primary border-4"
          style={
            {
              "--value": "70",
              "--size": "12rem",
              "--thickness": "2rem",
            } /* as React.CSSProperties */
          }
          aria-valuenow={70}
          role="progressbar"
        >
          70%
        </div>
        <div className="h-10"></div>
        <p className="text-3xl">Point 600</p>
      </div>
    </div>
  );
}
