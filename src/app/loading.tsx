import { ClipLoader } from "react-spinners";

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <ClipLoader size={50} color="#7557ff" />
    </div>
  );
}
