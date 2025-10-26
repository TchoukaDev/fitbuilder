import LogoutButton from "../components/Buttons/LogoutButton";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  console.log(session);
  return <LogoutButton />;
}
