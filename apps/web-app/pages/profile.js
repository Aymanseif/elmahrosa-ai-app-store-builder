import { useAuth } from '@clerk/nextjs';
import { UserButton } from '@clerk/nextjs';

export default function Profile() {
  const { signedIn, user } = useAuth();

  // Redirect to sign-in if not authenticated
  if (!signedIn) {
    // Assuming you have a sign-in page; adjust if needed
    window.location.href = '/signin';
    return null;
  }

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-2xl font-bold'>Profile</h1>
      <div className='bg-white rounded-lg shadow-md p-6 dark:bg-gray-800'>
        <p className='mb-2'><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
        <p className='mb-2'><strong>Email:</strong> {user?.primaryEmailAddress?.emailAddress}</p>
        <p className='mb-2'><strong>User ID:</strong> {user?.id}</p>
        <UserButton />
      </div>
    </div>
  );
}
