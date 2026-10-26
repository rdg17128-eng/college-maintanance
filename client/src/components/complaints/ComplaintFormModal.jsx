import React, { useState } from 'react';
import {
  X,
  Upload,
  Trash2
} from 'lucide-react';
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
      addToast('Please specify the room number or location code (e.g. Lab 204 or Hall A)', 'error');
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

      addToast('Maintenance issue reported successfully!', 'success');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      addToast(err.message || 'Failed to submit report', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl relative text-slate-800 animate-in fade-in duration-200 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Report Maintenance Issue
            </h2>
            <p className="text-xs text-slate-500">
              Fill in the location and details of the required repair.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          
          {/* Category */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Issue Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.label} ({cat.desc})
                </option>
              ))}
            </select>
          </div>

          {/* Building & Floor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Building *
              </label>
              <select
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {BUILDINGS.map(b => (
                  <option key={b.name} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Floor *
              </label>
              <select
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="Ground Floor">Ground Floor</option>
                <option value="1st Floor">1st Floor</option>
                <option value="2nd Floor">2nd Floor</option>
                <option value="3rd Floor">3rd Floor</option>
                <option value="4th Floor">4th Floor</option>
              </select>
            </div>
          </div>

          {/* Room Number & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Room / Area Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Room 204 or Lab 3"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Urgency / Priority *
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {PRIORITIES.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.label} - {p.desc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Description of Problem *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describe the issue clearly (e.g. Fan 2 regulator is stuck, AC is leaking water...)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Attach Photo (Optional)
            </label>
            {imageUrl ? (
              <div className="relative inline-block border border-slate-200 rounded-xl overflow-hidden bg-slate-50 p-1">
                <img
                  src={imageUrl}
                  alt="Attachment preview"
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 bg-rose-600 text-white p-1 rounded-md hover:bg-rose-700 shadow-sm"
                  title="Remove image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label className="border border-dashed border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30 rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer transition-colors text-slate-500">
                <Upload className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-[11px]">
                  {uploading ? 'Uploading photo...' : 'Click to upload photo of issue'}
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

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || uploading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm transition-all"
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
