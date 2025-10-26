import Link from "next/link";
import SignUpForm from "../components/Forms/SignUpForm/SignUpForm";
import WelcomeLayout from "../components/layout/WelcomeLayout/WelcomeLayout";

export default function signUp() {
  return (
    <WelcomeLayout>
      <div className="flex flex-col justify-center items-center p-10 flex-2/3">
        <h1>Inscription</h1>
        <p className="text-lg mb-5">
          Inscrivez-vous pour profiter pleinement de FitBuilder:
        </p>
        <SignUpForm />
        <Link href="/" className="text-sm my-5 link">
          Vous avez déjà un compte? Connectez-vous.
        </Link>
      </div>
    </WelcomeLayout>
  );
}
