import { useState } from "react"
import { useRouter } from "next/router"
import { useAuth } from "@clerk/nextjs"

export default function ProjectCreate() {
  const { signedIn } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    appName: "",
    description: "",
    templateType: "",
    theme: "",
    features: [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (!signedIn) {
    router.push("/login")
    return null
  }

  const steps = [
    { id: 1, title: "App Name", description: "Enter your app's name" },
    { id: 2, title: "Description", description: "Describe your app" },
    { id: 3, title: "Template Type", description: "Choose a template" },
    { id: 4, title: "Theme", description: "Select a theme" },
    { id: 5, title: "Features", description: "Pick features" },
  ];
  const currentStep = steps.find(s => s.id === step);

  const handleNext = () => {
    if (step < steps.length) setStep(step + 1)
  }

  const handlePrev = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (!formData.appName.trim()) {
        setError("App name is required")
        setLoading(false)
        return
      }
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      const newProjectId = Math.random().toString(36).substr(2, 9)
      router.push(`/project/${newProjectId}`)
    } catch (err) {
      setError("Failed to create project")
      setLogging(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create New Project</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Follow the steps to set up your new application.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex mb-6">
        {steps.map(s => (
          <div
            key={s.id}
            className={`flex-1 text-center py-2 ${
              s.id < step
                ? "bg-blue-500 text-white"
                : s.id === step
                ? "bg-blue-300 text-blue-800"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            <div>{s.id}</div>
            <div className="text-xs">{s.title}</div>
          </div>
        )}
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
        <h2 className="text-xl font-bold mb-4">{currentStep.title}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{currentStep.description}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 && (
            <>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                App Name
              </label>
              <input
                type="text"
                value={formData.appName}
                onChange={e => handleChange("appName", e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2"
                placeholder="Enter app name"
              />
            </>
          )}
          {step === 2 && (
            <>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={e => handleChange("description", e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2"
                rows={4}
                placeholder="Describe your app"
              />
            </>
          )}
          {step === 3 && (
            <>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Template Type
              </label>
              <select
                value={formData.templateType}
                onChange={e => handleChange("templateType", e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2"
              >
                <option value="">Select a template</option>
                <option value="saas">SaaS Dashboard</option>
              </select>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
