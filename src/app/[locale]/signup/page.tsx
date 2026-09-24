import { SignupForm } from "@/components/signup-form";
import { isGoogleOAuthConfigured } from "@/lib/auth/google-oauth";

export default function SignupPage() {
  const showGoogle = isGoogleOAuthConfigured();

  return <SignupForm showGoogle={showGoogle} />;
}
