import { ClipLoader } from "react-spinners";

export default function CustomLoader() {
    return (
        <>
            <div className="flex items-center justify-center min-h-screen">
                <ClipLoader size={60} color="#7557ff" />
            </div>
        </>
    );
}