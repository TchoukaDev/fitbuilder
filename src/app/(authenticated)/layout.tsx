import { Header } from "@/Global/components";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <Header />
            <main>
                {children}
            </main>
        </div>
    )
}