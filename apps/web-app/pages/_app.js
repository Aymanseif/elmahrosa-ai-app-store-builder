import "../styles/globals.css"
import { ClerkProvider } from "@clerk/nextjs"
import Navbar from "@/components/navbar"

// Wrap the app in ClerkProvider only when a real publishable key is
// configured. Prerendering pages without a key would throw, and a fake key
// fails Clerk's format validation — without a key the app still builds and
// serves its public pages (see .env.example to enable auth).
const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

export default function MyApp({ Component, pageProps }) {
  const content = (
    <>
      <Navbar />
      <Component {...pageProps} />
    </>
  )

  if (!publishableKey) {
    return content
  }

  return <ClerkProvider publishableKey={publishableKey}>{content}</ClerkProvider>
}
