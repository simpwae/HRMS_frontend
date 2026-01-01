import React from 'react';

export function BookWritingForm({ form, setForm }) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium">
          Name Of Author <span className="text-red-500">*</span>
        </label>
        <input
          className="w-full border rounded p-2"
          value={form.author || ''}
          onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">
          Book Title <span className="text-red-500">*</span>
        </label>
        <textarea
          className="w-full border rounded p-2"
          value={form.bookTitle || ''}
          onChange={(e) => setForm((f) => ({ ...f, bookTitle: e.target.value }))}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">
          Publisher Name Address <span className="text-red-500">*</span>
        </label>
        <textarea
          className="w-full border rounded p-2"
          value={form.publisher || ''}
          onChange={(e) => setForm((f) => ({ ...f, publisher: e.target.value }))}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">
          Date Of Publish <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          className="w-full border rounded p-2"
          value={form.dateOfPublish || ''}
          onChange={(e) => setForm((f) => ({ ...f, dateOfPublish: e.target.value }))}
          required
        />
      </div>
      {/* ...existing code for optional fields... */}
      <div>
        <label className="block text-sm font-medium">Written Addition Modification</label>
        <textarea
          className="w-full border rounded p-2"
          value={form.addition || ''}
          onChange={(e) => setForm((f) => ({ ...f, addition: e.target.value }))}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Website Link</label>
        <input
          className="w-full border rounded p-2"
          value={form.website || ''}
          onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">ISBN</label>
        <input
          className="w-full border rounded p-2"
          value={form.isbn || ''}
          onChange={(e) => setForm((f) => ({ ...f, isbn: e.target.value }))}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Publisher Name Address</label>
        <textarea
          className="w-full border rounded p-2"
          value={form.publisher || ''}
          onChange={(e) => setForm((f) => ({ ...f, publisher: e.target.value }))}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Chapter No</label>
        <input
          className="w-full border rounded p-2"
          value={form.chapterNo || ''}
          onChange={(e) => setForm((f) => ({ ...f, chapterNo: e.target.value }))}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Chapter Name</label>
        <textarea
          className="w-full border rounded p-2"
          value={form.chapterName || ''}
          onChange={(e) => setForm((f) => ({ ...f, chapterName: e.target.value }))}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Chapter Link</label>
        <input
          className="w-full border rounded p-2"
          value={form.chapterLink || ''}
          onChange={(e) => setForm((f) => ({ ...f, chapterLink: e.target.value }))}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Date Of Publish</label>
        <input
          type="date"
          className="w-full border rounded p-2"
          value={form.dateOfPublish || ''}
          onChange={(e) => setForm((f) => ({ ...f, dateOfPublish: e.target.value }))}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Place Of Publish</label>
        <textarea
          className="w-full border rounded p-2"
          value={form.placeOfPublish || ''}
          onChange={(e) => setForm((f) => ({ ...f, placeOfPublish: e.target.value }))}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Edition</label>
        <input
          className="w-full border rounded p-2"
          value={form.edition || ''}
          onChange={(e) => setForm((f) => ({ ...f, edition: e.target.value }))}
        />
      </div>
    </>
  );
}

export function ResearchPublicationForm({ form, setForm }) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium">
          Complete Name of Journal and Address <span className="text-red-500">*</span>
        </label>
        <textarea
          className="w-full border rounded p-2"
          value={form.journalAddress || ''}
          onChange={(e) => setForm((f) => ({ ...f, journalAddress: e.target.value }))}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">
          Title Of The Publication <span className="text-red-500">*</span>
        </label>
        <input
          className="w-full border rounded p-2"
          value={form.title || ''}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">
          Date Published <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          className="w-full border rounded p-2"
          value={form.datePublished || ''}
          onChange={(e) => setForm((f) => ({ ...f, datePublished: e.target.value }))}
          required
        />
      </div>
      {/* ...existing code for optional fields... */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium">Vol., Issue Number, & Page Nos.</label>
          <textarea
            className="w-full border rounded p-2"
            value={form.volume || ''}
            onChange={(e) => setForm((f) => ({ ...f, volume: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Date Published</label>
          <input
            type="date"
            className="w-full border rounded p-2"
            value={form.datePublished || ''}
            onChange={(e) => setForm((f) => ({ ...f, datePublished: e.target.value }))}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium">Journal Category (W.X.Y)</label>
        <input
          className="w-full border rounded p-2"
          value={form.journalCategory || ''}
          onChange={(e) => setForm((f) => ({ ...f, journalCategory: e.target.value }))}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Name Of Authors</label>
        <input
          className="w-full border rounded p-2"
          value={form.authors || ''}
          onChange={(e) => setForm((f) => ({ ...f, authors: e.target.value }))}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium">Impact Factor</label>
          <input
            className="w-full border rounded p-2"
            value={form.impactFactor || ''}
            onChange={(e) => setForm((f) => ({ ...f, impactFactor: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">DOI #</label>
          <input
            className="w-full border rounded p-2"
            value={form.doi || ''}
            onChange={(e) => setForm((f) => ({ ...f, doi: e.target.value }))}
          />
        </div>
      </div>
    </>
  );
}

export function ConferencePaperForm({ form, setForm }) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium">
          Name Of Authors <span className="text-red-500">*</span>
        </label>
        <input
          className="w-full border rounded p-2"
          value={form.authors || ''}
          onChange={(e) => setForm((f) => ({ ...f, authors: e.target.value }))}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">
          Title of the Publication <span className="text-red-500">*</span>
        </label>
        <input
          className="w-full border rounded p-2"
          value={form.title || ''}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">
          Conference Paper Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          className="w-full border rounded p-2"
          value={form.paperDate || ''}
          onChange={(e) => setForm((f) => ({ ...f, paperDate: e.target.value }))}
          required
        />
      </div>
      {/* ...existing code for optional fields... */}
      <div>
        <label className="block text-sm font-medium">Web Link</label>
        <input
          className="w-full border rounded p-2"
          value={form.webLink || ''}
          onChange={(e) => setForm((f) => ({ ...f, webLink: e.target.value }))}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Conference Paper Date</label>
        <input
          type="date"
          className="w-full border rounded p-2"
          value={form.paperDate || ''}
          onChange={(e) => setForm((f) => ({ ...f, paperDate: e.target.value }))}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Funded By</label>
        <textarea
          className="w-full border rounded p-2"
          value={form.fundedBy || ''}
          onChange={(e) => setForm((f) => ({ ...f, fundedBy: e.target.value }))}
        />
      </div>
    </>
  );
}
