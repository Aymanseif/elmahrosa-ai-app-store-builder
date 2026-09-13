import { useAuth, SignUp as ClerkSignUp } from "@clerk/nextjs"
import { useRouter } from "next/router"
import { useEffect } from "react"

export default function SignUp() {
  const { isLoaded, isSignedIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard")
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded || isSignedIn) {
    return null
  }

  return <ClerkSignUp />
}
