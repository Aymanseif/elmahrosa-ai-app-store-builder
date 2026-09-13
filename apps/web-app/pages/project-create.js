import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { useAuth } from "@clerk/nextjs"
import { WIZARD_STEPS } from '../lib/project-wizard-steps'

export default function ProjectCreate() {
  const { isLoaded, isSignedIn } = useAuth()
  const router = useRouter()
  const [stepIndex, setStepIndex] = useState(0)
  const [formData, setFormData] = useState({
    appName: "",
    appDescription: "",
    templateType: "",
    theme: "",
    features: [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/login")
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded || !isSignedIn) {
    return null
  }

  const currentStep = WIZARD_STEPS[stepIndex]

  const handleNext = () => {
    if (stepIndex < WIZARD_STEPS.length - 1) setStepIndex(stepIndex + 1)
  }

  const handlePrev = () => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1)
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Only the final step should actually submit; earlier "Next" buttons
    // just advance the wizard. (Original code submitted on every step.)
    if (stepIndex < WIZARD_STEPS.length - 1) {
      handleNext()
      return
    }

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
      setLoading(false)
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
        {WIZARD_STEPS.map((step, index) => (
          <div
            key={step.id}
            className={`flex-1 text-center py-2 ${
              index < stepIndex
                ? "bg-blue-500 text-white"
                : index === stepIndex
                ? "bg-blue-300 text-blue-800"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            <div>{index + 1}</div>
            <div className="text-xs">{step.title}</div>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
        <h2 className="text-xl font-bold mb-4">{currentStep.title}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{currentStep.description}</p>

        {error && (
          <div className="mb-4 text-sm text-red-600" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {currentStep.fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {field.label}
              </label>
              {field.type === "text" && (
                <input
                  type="text"
                  value={formData[field.name] || ""}
                  onChange={e => handleChange(field.name, e.target.value)}
                  required={field.required}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2"
                  placeholder={field.placeholder}
                  maxLength={field.maxLength}
                />
              )}
              {field.type === "textarea" && (
                <textarea
                  value={formData[field.name] || ""}
                  onChange={e => handleChange(field.name, e.target.value)}
                  required={field.required}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2"
                  rows={field.rows || 4}
                  placeholder={field.placeholder}
                  maxLength={field.maxLength}
                />
              )}
              {field.type === "select" && (
                <select
                  value={formData[field.name] || ""}
                  onChange={e => handleChange(field.name, e.target.value)}
                  required={field.required}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2"
                >
                  <option value="">{field.placeholder || "Select an option"}</option>
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
              {field.type === "checkbox-group" && (
                <div className="space-y-2">
                  {field.options.map((option) => (
                    <div key={option.value} className="flex items-start">
                      <input
                        type="checkbox"
                        value={option.value}
                        checked={(formData[field.name] || []).includes(option.value)}
                        onChange={e => {
                          const checkedOptions = formData[field.name] || []
                          if (e.target.checked) {
                            setFormData(prev => ({ ...prev, [field.name]: [...checkedOptions, option.value] }))
                          } else {
                            setFormData(prev => ({ ...prev, [field.name]: checkedOptions.filter(v => v !== option.value) }))
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {stepIndex < WIZARD_STEPS.length - 1 && (
            <div className="flex justify-between">
              {stepIndex > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Previous
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-blue-400 hover:bg-blue-600"
              >
                Next Step
              </button>
            </div>
          )}

          {stepIndex === WIZARD_STEPS.length - 1 && (
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-blue-400 hover:bg-blue-600"
              >
                {loading ? "Creating..." : "Create Project"}
              </button>
            </div>
          )}
        </form>
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
