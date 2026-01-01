import { useState } from 'react';

const INIT = {
  balance: 100000, // Mocked
  years: '',
  age: '',
  type: 'Refundable',
  amount: '',
};

export default function EmployeeRequestForm({ onSubmitRequest }) {
  const [form, setForm] = useState(INIT);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const maxEligible = form.balance * 0.8;
  const isNonRefundable = form.type === 'Non-Refundable';

  function validate() {
    if (+form.years < 3) return 'You must have at least 3 years of service.';
    if (isNonRefundable && +form.age < 50) return 'Non-Refundable loan requires age ≥ 50.';
    if (+form.amount > maxEligible) return 'Requested amount exceeds 80% of balance.';
    return '';
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setError('');
    setSuccess('');
  }

  function handleSubmit(e) {
    e.preventDefault();
    const err = validate();
    if (err) return setError(err);
    setSuccess('Request submitted!');
    if (onSubmitRequest) onSubmitRequest({ ...form, requested: +form.amount });
    setForm(INIT);
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Provident Fund Loan/Withdrawal Request</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Accumulated Fund Balance</label>
          <input
            type="number"
            name="balance"
            value={form.balance}
            disabled
            className="w-full border rounded p-2 bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Years of Service</label>
          <input
            type="number"
            name="years"
            value={form.years}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Age</label>
          <input
            type="number"
            name="age"
            value={form.age}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Loan Type</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full border rounded p-2"
          >
            <option value="Refundable">Refundable</option>
            <option value="Non-Refundable">Non-Refundable</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Requested Amount</label>
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
          <div className="text-xs text-gray-500 mt-1">
            Max eligible: {maxEligible.toLocaleString()}
          </div>
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Submit Request
        </button>
      </form>
    </div>
  );
}
