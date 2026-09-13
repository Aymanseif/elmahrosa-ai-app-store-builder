import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function ProjectDetail() {
  const { isLoaded, isSignedIn } = useAuth()
  const router = useRouter()
  const { id } = router.query
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/login")
    }
  }, [isLoaded, isSignedIn, router])

  useEffect(() => {
    if (!id) return
    // Simulate fetching project data
    setLoading(true)
    // In a real app, you would fetch from an API using the id
    const mockProject = {
      id,
      name: `Project ${id}`,
      description: 'This is a sample project description. In a real application, this data would come from your database.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      template: 'SaaS Dashboard',
      theme: 'Blue',
      features: ['Authentication', 'Database', 'API'],
    }
    setProject(mockProject)
    setLoading(false)
  }, [id])

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

  if (!project) {
    return (
      <div className="container mx-auto p-4">
        <p className="text-red-500">Project not found.</p>
      </div>
    )
  }

  const handleStartGeneration = () => {
    // In a real app, this would trigger a generation process
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
          <p className="mt-1 text-lg text-gray-900 dark:text-white">{project.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Template</p>
            <p className="mt-1 text-gray-900 dark:text-white">{project.template}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Theme</p>
            <p className="mt-1 text-gray-900 dark:text-white">{project.theme}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
            <p className="mt-1 text-gray-900 dark:text-white">
              {new Date(project.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Updated</p>
            <p className="mt-1 text-gray-900 dark:text-white">
              {new Date(project.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Features</p>
          <div className="flex flex-wrap gap-2">
            {project.features.map((feature) => (
              <span
                key={feature}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded dark:bg-blue-200 dark:text-blue-800"
              >
                {feature}
              </span>
            ))}
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
