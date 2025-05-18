"use client";

export default function Profile() {
  const links = [{ title: "Contests", href: "/contest" }];
  return (
    <div className="w-full grid grid-cols-4 gap-10 flex-1">
      {Array.from({ length: 6 }, (_, index) => (
        <div className="card bg-base-100 w-96 shadow-sm" key={index}>
          <figure>
            <img
              src="https://imgur.com/M8ORacF.png"
              style={{ height: "200px", objectFit: "cover", width: "100%" }}
            />
          </figure>
          <div className="card-body">
            <h2 className="card-title">OOP Midterm</h2>
            <p>Start from 2023-10-01 00:00:00</p>
            <p>End at 2023-10-31 23:59:59</p>
            <div className="card-actions justify-end">
              <button className="btn btn-primary">Join</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
