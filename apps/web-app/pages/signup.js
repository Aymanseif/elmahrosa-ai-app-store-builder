import { useAuth } from \
@clerk/nextjs\
import { useRouter } from \next/router\
import { SignUp } from \@clerk/nextjs\
export default function SignUp() {
  const { signedIn } = useAuth()
  const router = useRouter()
  //      const { signedIn } = useAuth()
}
