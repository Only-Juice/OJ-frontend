import Navbar from "@/components/Navbar";

export default function Profile() {
  return (
    <div>
      <Navbar></Navbar>
      <div className="w-full pt-25 p-10 flex justify-center gap-10 min-h-screen">
        <div className="card flex-1 flex flex-col gap-10 items-center pt-10 bg-base-100">
          <div className="card-body gap-5">
            <img
              alt="Only Juice"
              src="https://avatars.githubusercontent.com/u/184535404?s=200&v=4"
              className="rounded-lg"
            />
            <h2 className="card-title">Username</h2>
            User ID
            <button className="btn btn-primary">Edit Profile</button>
          </div>
        </div>
        <div className="flex-3 flex flex-col gap-10">
          <div className="flex-1 flex gap-10">
            <div className="card flex-1 bg-base-200">
              <div className="card-body"></div>
            </div>
            <div className="card flex-1 bg-base-200">
              <div className="card-body">
                <div className="flex flex-wrap gap-5">
                  {Array.from({ length: 10 }).map((_, index) => {
                    const colors = ["#1CBABA", "#FFB700", "#F63737"];
                    const randomColor =
                      colors[Math.floor(Math.random() * colors.length)];
                    return (
                      <div
                        key={index}
                        className="w-12 h-12 flex  items-center justify-center text-white rounded"
                        style={{ backgroundColor: randomColor }}
                      ></div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          <div className="card flex-1 flex flex-col gap-10 items-center pt-10 bg-base-100">
            <div className="card-body w-full">
              <ul className="list">
                {Array.from({ length: 5 }).map((_, index) => {
                  return (
                    <li key={index} className="list-row">
                      <p>2025-01-{index + 1}</p>
                      <p>100</p>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
