import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import { Calendar, Heart, Shield, Clock, AlertCircle } from 'lucide-react'
import type { AnimalHealthRecord } from '@renderer/types/models'
import { Badge } from '../ui/badge'

interface UpcomingEvent extends AnimalHealthRecord {
  animal_name: string
  tagNumber?: string
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

  const getDaysUntil = (dateString: string): number => {
    const today = new Date()
    const eventDate = new Date(dateString)
    const diffTime = eventDate.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
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
      return event.expected_delivery_date
    }
    return event.date
  }

  const getUrgencyBadge = (daysUntil: number): ReactElement | null => {
    if (daysUntil < 0) {
      return <Badge variant="destructive" className="text-xs">Overdue</Badge>
    } else if (daysUntil <= 3) {
      return <Badge variant="destructive" className="text-xs">Urgent</Badge>
    } else if (daysUntil <= 7) {
      return <Badge variant="secondary" className="text-xs">Soon</Badge>
    }
    return null
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
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-muted rounded"></div>
                  <div className="space-y-1">
                    <div className="w-24 h-4 bg-muted rounded"></div>
                    <div className="w-16 h-3 bg-muted rounded"></div>
                  </div>
                </div>
                <div className="w-16 h-4 bg-muted rounded"></div>
              </div>
            ))}
          </div>
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
          <div className="flex items-center gap-2 text-destructive py-4">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
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
          {events.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {events.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground font-medium">No upcoming events</p>
            <p className="text-sm text-muted-foreground">
              All your animals are up to date!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.slice(0, 5).map((event) => {
              const eventDate = getEventDate(event)
              const daysUntil = getDaysUntil(eventDate)
              const urgencyBadge = getUrgencyBadge(daysUntil)
              
              return (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getEventIcon(event.record_type)}
                    <div>
                      <div className="font-medium">
                        {event.animal_name}
                        {event.tagNumber && (
                          <span className="ml-2 text-xs bg-muted px-2 py-1 rounded-md font-normal">
                            #{event.tagNumber}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {getEventTitle(event)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {urgencyBadge}
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {formatDate(eventDate)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {daysUntil === 0 ? 'Today' : 
                         daysUntil === 1 ? 'Tomorrow' :
                         daysUntil < 0 ? `${Math.abs(daysUntil)} days ago` :
                         `${daysUntil} days`}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            {events.length > 5 && (
              <div className="text-center pt-2">
                <p className="text-sm text-muted-foreground">
                  +{events.length - 5} more events
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default UpcomingEvents