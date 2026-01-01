import { useState } from 'react';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import FormField from '../../../components/FormField';

export default function VPAdvisory() {
    const [advisory, setAdvisory] = useState('');
    const [sent, setSent] = useState(false);

    const handleSubmit = () => {
        if (!advisory.trim()) return;
        // In a real app, this would send to an API
        console.log('Advisory sent:', advisory);
        setSent(true);
        setAdvisory('');
        setTimeout(() => setSent(false), 3000);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Card title="Executive Advisory" subtitle="Send advisory notes to Deans and HODs">
                <div className="space-y-4">
                    <FormField label="Advisory Note" id="advisory">
                        <textarea
                            id="advisory"
                            rows={6}
                            className="w-full border-gray-300 rounded-md shadow-xs focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-3 border"
                            placeholder="Enter your advisory instructions or feedback here..."
                            value={advisory}
                            onChange={(e) => setAdvisory(e.target.value)}
                        />
                    </FormField>

                    <div className="flex justify-end">
                        <Button onClick={handleSubmit}>Send Advisory</Button>
                    </div>

                    {sent && (
                        <div className="p-4 bg-green-50 text-green-700 rounded-md border border-green-200">
                            Advisory sent successfully!
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
