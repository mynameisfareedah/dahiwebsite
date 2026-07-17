import React from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';

export function EventImageUploader({ previewUrl, fileName, onFileChange }) {
  return (
    <div className="space-y-3 rounded-3xl border border-gray-700 bg-gray-900/80 p-5 text-white">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-100">Event Image</h2>
          <p className="text-xs text-gray-400">Upload a poster or featured image for this event.</p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
          <ImagePlus size={16} />
          <span>Select image</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0] || null;
              onFileChange(file);
            }}
          />
        </label>
      </div>

      {previewUrl ? (
        <div className="relative overflow-hidden rounded-3xl border border-gray-700 bg-slate-950">
          <img src={previewUrl} alt={fileName || 'Event poster preview'} className="h-72 w-full object-cover" />
          <button
            type="button"
            onClick={() => onFileChange(null)}
            className="absolute right-4 top-4 rounded-full bg-black/70 p-2 text-white hover:bg-black"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ) : (
        <div className="flex min-h-[12rem] items-center justify-center rounded-3xl border border-dashed border-gray-700 bg-slate-950/40 text-sm text-gray-400">
          Select an image to preview
        </div>
      )}
    </div>
  );
}
