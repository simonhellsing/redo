import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Redo</h1>
        <p className="text-xl text-gray-600 mb-8">
          Financial reporting and analysis for small businesses
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <Button size="lg">Log in</Button>
          </Link>
          <Link href="/signup">
            <Button variant="outline" size="lg">Sign up</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

