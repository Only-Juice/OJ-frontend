import Navbar from "@/components/Navbar";
import Table from "@/components/Table";

export default function Problems() {
  return (
    <div className="pt-20">
      <Navbar></Navbar>
      <div className="w-3/4">
        <Table></Table>
      </div>
      <div className="w-1/4"></div>
    </div>
  );
}
