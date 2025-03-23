import Navbar from "@/components/Navbar";
import ProblemsTable from "@/components/ProblemsTable";

export default function Problem() {
  const formatNumber = (num: number) => String(num).padStart(2, "0");
  const fakeTableData = Array.from({ length: 100 }).map((_, index) => {
    const day = formatNumber(index + 1);
    return {
      title: `Question ${index + 1}`,
      startDate: `2025-01-${day} 23:59:59`,
      endDate: `2025-01-${day} 23:59:59`,
      status: index < 10,
    };
  });
  return (
    <div>
      <Navbar></Navbar>
      <div className="w-full pt-25 p-10 flex justify-center gap-10">
        <div className="w-3/4">
          <ProblemsTable data={fakeTableData}></ProblemsTable>
        </div>
        <div className="w-1/4">
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
        </div>
      </div>
    </div>
  );
}
