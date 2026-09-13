import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/router"
import { useEffect } from "react"
import Link from "next/link"
import ProjectCard from "@/components/ProjectCard"

export default function Projects() {
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

  // Mock projects data - in a real app, fetch from API
  const mockProjects = [
    { id: "1", name: "Project Alpha", description: "A SaaS dashboard for managing tasks.", updatedAt: new Date() },
    { id: "2", name: "Project Beta", description: "An e-commerce store with payment integration.", updatedAt: new Date(Date.now() - 86400000) },
    { id: "3", name: "Project Gamma", description: "A blog platform with SEO features.", updatedAt: new Date(Date.now() - 2 * 86400000) },
  ]

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

      <div className="space-y-4">
        {mockProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
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
