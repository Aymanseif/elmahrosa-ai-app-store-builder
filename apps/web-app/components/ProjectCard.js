import Link from "next/link";

export default function ProjectCard({ project }) {
  return (
    <Link
      href={`/project/${project.id}`}
      className="group block border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors dark:border-gray-700 dark:hover:border-gray-600"
    >
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{project.name}</h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {project.description || "No description."}
        </p>
        <div className="mt-3 flex items-center text-xs text-gray-500 dark:text-gray-400">
          <span>
            Updated:{" "}
            {project.updatedAt
              ? new Date(project.updatedAt).toLocaleDateString()
              : "—"}
          </span>
        </div>
      </div>
    </Link>
  );
}
