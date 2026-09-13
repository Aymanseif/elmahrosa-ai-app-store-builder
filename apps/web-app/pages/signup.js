import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/router"
import { SignUp as ClerkSignUp } from "@clerk/nextjs"

export default function SignUp() {
  const { signedIn } = useAuth()
  const router = useRouter()

  // Redirect to dashboard if already signed in
  if (signedIn) {
    router.push("/dashboard")
    return null
  }

  return <ClerkSignUp />
}