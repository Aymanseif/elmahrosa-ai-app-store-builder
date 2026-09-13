import { useAuth, useUser, UserButton } from "@clerk/nextjs"
import { useRouter } from "next/router"
import { useEffect } from "react"

export default function Profile() {
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()
  const router = useRouter()

  useEffect(() => {
    // NOTE: original code redirected to "/signin", which doesn't exist in
    // this app's page set — the real route is "/login".
    if (isLoaded && !isSignedIn) {
      router.push("/login")
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded || !isSignedIn) {
    return null
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Profile</h1>
      <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
        <p className="mb-2">
          <strong>Name:</strong> {user?.firstName} {user?.lastName}
        </p>
        <p className="mb-2">
          <strong>Email:</strong> {user?.primaryEmailAddress?.emailAddress}
        </p>
        <p className="mb-2">
          <strong>User ID:</strong> {user?.id}
        </p>
        <UserButton />
      </div>
    </div>
  )
}
// Server-rendered at request time instead of statically prerendered at
// build time: these pages use Clerk auth, which requires a publishable key
// that is not available during builds without configuration.
export async function getServerSideProps() {
  return { props: {} }
}
