import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/router"
import Link from "next/link"
import ProjectCard from "@/components/ProjectCard"

export default function Projects() {
  const { signedIn } = useAuth()
  const router = useRouter()

  // Redirect to sign-in if not authenticated
  if (!signedIn) {
    router.push("/login")
    return null
  }

  // Mock projects data - in a real app, fetch from API
  const mockProjects = [
    { id: "1", name: "Project Alpha", description: "A SaaS dashboard for managing tasks.", updatedAt: new Date() },
    { id: "2", name: "Project Beta", description: "An e-commerce store with payment integration.", updatedAt: new Date(Date.now() - 86400000) },
    { id: "3", name: "Project Gamma", description: "A blog platform with SEO features.", updatedAt: new Date(Date.now() - 2*86400000) },
  ]

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Projects</h1>
        <Link href="/project-create">
          <a className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-md text-white">
            Create New Project
          </a>
        </Link>
      </div>

      <div className="space-y-4">
        {mockProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </devel
