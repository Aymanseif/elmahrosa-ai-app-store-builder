import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Link from "next/link"
import ProjectCard from "@/components/ProjectCard"
import api from "@/lib/api"

export default function Projects() {
  const { isLoaded, isSignedIn, getToken } = useAuth()
  const router = useRouter()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/login")
    }
  }, [isLoaded, isSignedIn, router])

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const token = await getToken()
        const data = await api.getProjects(token)
        if (!cancelled) setProjects(Array.isArray(data) ? data : [])
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
  }, [isLoaded, isSignedIn, getToken])

  if (!isLoaded || !isSignedIn) {
    return null
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Projects</h1>
        <Link
          href="/project-create"
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-md text-white"
        >
          Create New Project
        </Link>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600" role="alert">
          Failed to load projects: {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full border-4 border-blue-500 border-t-transparent h-8 w-8"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
          {!loading && projects.length === 0 && !error && (
            <p className="text-gray-600 dark:text-gray-400">
              No projects yet. Create your first project to get started.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
// Server-rendered at request time instead of statically prerendered at
// build time: these pages use Clerk auth, which requires a publishable key
// that is not available during builds without configuration.
export async function getServerSideProps() {
  return { props: {} }
}
