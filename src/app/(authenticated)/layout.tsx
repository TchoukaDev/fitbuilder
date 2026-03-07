import { Header } from "@/Global/components";
// import { ChatFAB } from "@/Features/Chat";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <Header />
            <main>
                {children}
            </main>
            <ChatFAB />
        </div>
    )
}