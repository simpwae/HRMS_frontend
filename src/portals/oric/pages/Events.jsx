import React from 'react';
import Card from '../../../components/Card';
import { dummyEvents } from '../data/oricData';

export default function Events() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Events & Workshops</h2>
        <p className="text-gray-500 mt-1">Upcoming events and workshops.</p>
      </div>

      <Card title="All Events">
        <div className="space-y-4">
          {dummyEvents.map((event) => (
            <div
              key={event.id}
              className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="shrink-0 w-20 h-20 bg-blue-100 rounded-lg flex flex-col items-center justify-center">
                <span className="text-xs text-blue-600 font-medium">
                  {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                </span>
                <span className="text-lg font-bold text-blue-700">
                  {new Date(event.date).getDate()}
                </span>
              </div>
              <div className="flex-1">
                <h5 className="text-sm font-semibold text-gray-900">{event.title}</h5>
                <p className="text-sm text-gray-600 mt-1">
                  📍 {event.location} • 👥 {event.attendees} attendees
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded font-medium">
                    {event.type}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
