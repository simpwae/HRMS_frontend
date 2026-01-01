import React from 'react';
import Card from '../../../components/Card';
import { dummyPatents } from '../data/oricData';

export default function Patents() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Intellectual Property</h2>
        <p className="text-gray-500 mt-1">Patents and other intellectual property.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dummyPatents.map((patent) => (
          <Card key={patent.id}>
            <div className="space-y-3">
              <h5 className="text-sm font-semibold text-gray-900">{patent.title}</h5>
              <p className="text-sm text-gray-600">Inventors: {patent.inventors}</p>
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Patent #:</span>
                  <span className="text-xs font-mono text-gray-900">{patent.number}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Year:</span>
                  <span className="text-sm text-gray-900">{patent.year}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Status:</span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      patent.status === 'Granted'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {patent.status}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
