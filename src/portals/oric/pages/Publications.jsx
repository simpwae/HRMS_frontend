import React from 'react';
import Card from '../../../components/Card';
import { dummyPublications } from '../data/oricData';

export default function Publications() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Publications</h2>
        <p className="text-gray-500 mt-1">Research publications and journal articles.</p>
      </div>

      <Card title="All Publications">
        <div className="space-y-4">
          {dummyPublications.map((pub) => (
            <div key={pub.id} className="border-b border-gray-200 pb-4 last:border-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900">{pub.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {pub.authors} • {pub.journal}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-gray-500">Year: {pub.year}</span>
                    <span className="text-xs font-medium text-blue-600">
                      Impact Factor: {pub.impact}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
