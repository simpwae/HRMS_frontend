import { useState } from 'react';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import { DocumentTextIcon, ArrowDownTrayIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const policies = [
  {
    id: 1,
    title: 'CECPF Provident Fund Policy',
    description: 'Employee contributory provident fund rules and procedures',
    updated: '2021-12-10',
    status: 'Active',
  },
  {
    id: 2,
    title: 'Fund Withdrawal Guidelines',
    description: 'Procedures and eligibility for fund withdrawals',
    updated: '2024-11-20',
    status: 'Active',
  },
  {
    id: 3,
    title: 'Loan Repayment Policy',
    description: 'Loan disbursement and monthly installment recovery procedures',
    updated: '2024-10-15',
    status: 'Active',
  },
];

export default function FinancePolicyAdvisory() {
  const handleDownload = (policy) => {
    const link = document.createElement('a');
    link.href = `/PDF's/4. CECPF 10 Dec 21.pdf`;
    link.download = `${policy.title}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Policy Advisory</h1>
        <p className="text-gray-600">Provident fund policies and guidelines</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <DocumentTextIcon className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-sm text-gray-600">Total Policies</p>
              <p className="text-2xl font-bold">{policies.length}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold">
                {policies.filter((p) => p.status === 'Active').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <div className="flex items-center gap-3">
            <ArrowDownTrayIcon className="w-8 h-8 text-purple-400" />
            <div>
              <p className="text-sm text-gray-600">Downloads</p>
              <p className="text-2xl font-bold">1.2K</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        {policies.map((policy) => (
          <Card key={policy.id} className="hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <DocumentTextIcon className="w-6 h-6 text-blue-600 shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">{policy.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{policy.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="success" size="xs">
                      {policy.status}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      Updated: {new Date(policy.updated).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <Button size="sm" onClick={() => handleDownload(policy)} className="gap-2 shrink-0">
                <ArrowDownTrayIcon className="w-4 h-4" />
                Download
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
