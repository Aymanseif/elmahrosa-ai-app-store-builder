import { useAuth, UserButton } from "@clerk/nextjs"
import { useRouter } from "next/router"
import { useEffect } from "react"

export default function Dashboard() {
  const { isLoaded, isSignedIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/login")
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded || !isSignedIn) {
    return null
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <UserButton />
    </div>
  )
}
// Server-rendered at request time instead of statically prerendered at
// build time: these pages use Clerk auth, which requires a publishable key
// that is not available during builds without configuration.
export async function getServerSideProps() {
  return { props: {} }
}
