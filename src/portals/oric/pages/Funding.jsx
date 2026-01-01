import React from 'react';
import Card from '../../../components/Card';
import { dummyGrants } from '../data/oricData';

export default function Funding() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Funding & Grants</h2>
        <p className="text-gray-500 mt-1">Overview of all grants and funding sources.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dummyGrants.map((grant) => (
          <Card key={grant.id}>
            <div className="space-y-3">
              <h5 className="text-sm font-semibold text-gray-900">{grant.title}</h5>
              <p className="text-sm text-gray-600">Agency: {grant.agency}</p>
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Amount:</span>
                  <span className="text-sm font-bold text-green-600">{grant.amount}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Year:</span>
                  <span className="text-sm text-gray-900">{grant.year}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Status:</span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      grant.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {grant.status}
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
