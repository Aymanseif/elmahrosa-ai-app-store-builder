import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/router"
import { UserButton } from "@clerk/nextjs"

export default function Dashboard() {
  const { signedIn } = useAuth()
  const router = useRouter()

  // Redirect to sign-in if not authenticated
  if (!signedIn) {
    router.push("/login")
    return null
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <UserButton />
    </div>
  )
}
