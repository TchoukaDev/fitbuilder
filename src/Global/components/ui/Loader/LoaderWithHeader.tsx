import { ClipLoader } from "react-spinners";
import { Header } from "../..";

export default function LoaderWithHeader() {
    return (
        <>
            <Header />
            <div className="flex items-center justify-center min-h-screen">
                <ClipLoader size={60} color="#7557ff" />
            </div>
        </>
    );
}