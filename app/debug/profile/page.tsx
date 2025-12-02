import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { Card } from '@/components/ui/Card'

export default async function DebugProfilePage() {
  const user = await getCurrentUser()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card>
          <h1 className="text-xl font-bold mb-4">Not logged in</h1>
          <p>Please log in first.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-2xl w-full">
        <h1 className="text-2xl font-bold mb-4">Profile Debug Info</h1>
        <div className="space-y-4">
          <div>
            <h2 className="font-semibold mb-2">User Info:</h2>
            <pre className="bg-gray-50 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(
                {
                  id: user.id,
                  email: user.email,
                  created_at: user.created_at,
                },
                null,
                2
              )}
            </pre>
          </div>
          <div>
            <h2 className="font-semibold mb-2">Profile Info:</h2>
            {user.profile ? (
              <pre className="bg-gray-50 p-4 rounded overflow-auto text-sm">
                {JSON.stringify(user.profile, null, 2)}
              </pre>
            ) : (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                <p className="font-semibold">Profile does not exist!</p>
                <p className="text-sm mt-1">
                  The profile should be created automatically. Check:
                </p>
                <ul className="text-sm mt-2 list-disc list-inside">
                  <li>Is the database trigger set up? (Run supabase-schema.sql)</li>
                  <li>Check Supabase logs for errors</li>
                </ul>
              </div>
            )}
          </div>
          {user.profile && user.profile.role !== 'administrator' && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
              <p className="font-semibold">Role Issue:</p>
              <p>Current role: {user.profile.role}</p>
              <p>Expected role: administrator</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

