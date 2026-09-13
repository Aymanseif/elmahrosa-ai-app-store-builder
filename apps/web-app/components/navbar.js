import Link from "next/link"

export default function Navbar() {
  return (
    <nav className="bg-white border-gray-200 px-2 sm:px-4 py-2.5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="container flex flex-wrap items-center justify-between mx-auto">
        <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Elmahrosa</span>
        </Link>
        <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
          <Link href="/dashboard" className="text-gray-700 bg-blue-50 hover:bg-blue-100 font-medium rounded-lg text-sm px-4 py-2 me-2 dark:bg-blue-400 dark:text-blue-800 dark:hover:bg-blue-300 dark:hover:text-blue-900">
            Dashboard
          </Link>
          <Link href="/projects" className="text-gray-700 hover:bg-gray-100 font-medium rounded-lg text-sm px-4 py-2 me-2 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white">
            Projects
          </Link>
          <Link href="/pricing" className="text-gray-700 hover:bg-gray-100 font-medium rounded-lg text-sm px-4 py-2 me-2 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white">
            Pricing
          </Link>
          <Link href="/profile" className="text-gray-700 hover:bg-gray-100 font-medium rounded-lg text-sm px-4 py-2 me-2 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white">
            Profile
          </Link>
        </div>
      </div>
    </nav>
  );
}