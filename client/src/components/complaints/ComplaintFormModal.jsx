import React, { useState } from 'react';
import { BUILDINGS, CATEGORIES, PRIORITIES } from '../../constants';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export function ComplaintFormModal({ isOpen, onClose, onSuccess }) {
  const { addToast } = useToast();

  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [building, setBuilding] = useState(BUILDINGS[0].name);
  const [roomNumber, setRoomNumber] = useState('');
  const [floor, setFloor] = useState('1st Floor');
  const [priority, setPriority] = useState('Medium');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Please upload an image file (PNG, JPG, WebP)', 'error');
      return;
    }

    setUploading(true);
    try {
      const data = await api.uploadImage(file);
      setImageUrl(data.imageUrl);
      addToast('Photo uploaded successfully', 'success');
    } catch (err) {
      addToast(err.message || 'Image upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!roomNumber.trim()) {
      addToast('Please specify the room number or location code', 'error');
      return;
    }

    if (description.trim().length < 5) {
      addToast('Please provide a brief description of the issue', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.createComplaint({
        category,
        building,
        roomNumber: roomNumber.trim(),
        floor,
        roomType: 'General',
        priority,
        description: description.trim(),
        imageUrl: imageUrl || null
      });

      addToast('Maintenance issue reported successfully', 'success');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      addToast(err.message || 'Failed to submit report', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
      <div className="bg-white rounded-xl border border-slate-300 max-w-lg w-full p-6 shadow-lg relative text-slate-800 max-h-[92vh] overflow-y-auto">
        
        {/* Header - Text Only */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Report Campus Issue
            </h2>
            <p className="text-xs text-slate-500">
              Fill in the location and details of the required repair.
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded border border-slate-200 text-xs font-bold cursor-pointer"
          >
            Close
          </button>
        </div>

        {/* Form - Simple Code & Text Only */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Issue Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.label} ({cat.desc})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Building *
              </label>
              <select
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                {BUILDINGS.map(b => (
                  <option key={b.name} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Floor *
              </label>
              <select
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="Ground Floor">Ground Floor</option>
                <option value="1st Floor">1st Floor</option>
                <option value="2nd Floor">2nd Floor</option>
                <option value="3rd Floor">3rd Floor</option>
                <option value="4th Floor">4th Floor</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Room / Area Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Room 204 or Lab 3"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Priority *
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                {PRIORITIES.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.label} - {p.desc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Description of Problem *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describe the issue clearly..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-sky-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Photo Attachment (Optional)
            </label>
            {imageUrl ? (
              <div className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-300 rounded">
                <span className="text-xs font-semibold text-emerald-700">Image attached</span>
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded text-xs font-bold cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="block border border-dashed border-slate-300 bg-slate-50 p-3 rounded text-center cursor-pointer hover:bg-slate-100">
                <span className="text-xs text-slate-600 font-semibold">
                  {uploading ? 'Uploading...' : 'Click to select image file'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || uploading}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded cursor-pointer"
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
