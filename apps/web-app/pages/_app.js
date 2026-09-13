import "../styles/globals.css"
import { ClerkProvider } from "@clerk/nextjs"
import Navbar from "@/components/navbar"

export default function MyApp({ Component, pageProps }) {
  return (
    <ClerkProvider>
      <Navbar />
      <Component {...pageProps} />
    </ClerkProvider>
  )
}
