import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import { Calendar, Heart, Shield } from 'lucide-react'
import type { AnimalHealthRecord } from '@renderer/types/models'

interface UpcomingEvent extends AnimalHealthRecord {
  animal_name: string
}

export function UpcomingEvents(): ReactElement {
  const [events, setEvents] = useState<UpcomingEvent[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadUpcomingEvents = async (): Promise<void> => {
      try {
        const data = await window.api.getUpcomingEvents()
        setEvents(data)
        setError(null)
      } catch (err) {
        console.error('Failed to load upcoming events:', err)
        setError('Failed to load upcoming events')
      } finally {
        setLoading(false)
      }
    }

    loadUpcomingEvents()
  }, [])

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const year = date.getFullYear()
    return `${day} ${month} ${year}`
  }

  const getEventIcon = (recordType: string): ReactElement => {
    switch (recordType) {
      case 'insemination':
        return <Heart className="h-4 w-4 text-pink-500" />
      case 'deworming':
        return <Shield className="h-4 w-4 text-blue-500" />
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />
    }
  }

  const getEventTitle = (event: UpcomingEvent): string => {
    if (event.record_type === 'insemination' && event.expected_delivery_date) {
      return 'Expected Delivery'
    }
    return event.record_type === 'insemination' ? 'Insemination' : 'Deworming'
  }

  const getEventDate = (event: UpcomingEvent): string => {
    if (event.record_type === 'insemination' && event.expected_delivery_date) {
      return formatDate(event.expected_delivery_date)
    }
    return formatDate(event.date)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading upcoming events...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500 py-4">{error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center text-gray-500 py-4">No upcoming events</div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getEventIcon(event.record_type)}
                  <div>
                    <div className="font-medium">{event.animal_name}</div>
                    <div className="text-sm text-gray-600">{getEventTitle(event)}</div>
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-700">
                  {getEventDate(event)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default UpcomingEvents