import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Link from "next/link"
import api from "@/lib/api"

export default function ProjectDetail() {
  const { isLoaded, isSignedIn, getToken } = useAuth()
  const router = useRouter()
  const { id } = router.query
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/login")
    }
  }, [isLoaded, isSignedIn, router])

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !id) return
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const token = await getToken()
        const data = await api.getProject(id, token)
        if (!cancelled) setProject(data)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [isLoaded, isSignedIn, id, getToken])

  if (!isLoaded || !isSignedIn) {
    return null
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full border-4 border-blue-500 border-t-transparent h-8 w-8"></div>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="container mx-auto p-4">
        <p className="text-red-500">{error || "Project not found."}</p>
      </div>
    )
  }

  const handleStartGeneration = () => {
    // TODO: trigger the build pipeline (POST /api/builds) once wired up.
    alert('Generation started! (This is a demo)')
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <Link
          href={`/project/${project.id}/edit`}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-md text-white text-sm"
        >
          Edit
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
        <div className="mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
          <p className="mt-1 text-lg text-gray-900 dark:text-white">{project.description || "No description."}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
            <p className="mt-1 text-gray-900 dark:text-white">{project.status || "active"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
            <p className="mt-1 text-gray-900 dark:text-white">
              {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : "—"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Updated</p>
            <p className="mt-1 text-gray-900 dark:text-white">
              {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : "—"}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={handleStartGeneration}
            className="w-full px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg text-white font-medium flex items-center justify-center"
          >
            Start Generation
          </button>
        </div>
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
