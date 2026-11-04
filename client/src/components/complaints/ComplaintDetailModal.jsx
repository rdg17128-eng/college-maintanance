import React, { useState, useEffect } from 'react';
import { StatusBadge, PriorityBadge } from '../common/Badges';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export function ComplaintDetailModal({ complaintId, onClose, onRefresh }) {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Admin update form state
  const [newStatus, setNewStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!complaintId) return;

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await api.getComplaintDetail(complaintId);
        setData(res);
        setNewStatus(res.complaint.status);
      } catch (err) {
        addToast(err.message || 'Failed to load details', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [complaintId]);

  if (!complaintId) return null;

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!newStatus) return;

    setSaving(true);
    try {
      await api.updateStatus(complaintId, {
        status: newStatus,
        remarks: remarks.trim() || undefined
      });
      addToast(`Status updated to ${newStatus}`, 'success');
      if (onRefresh) onRefresh();
      
      const res = await api.getComplaintDetail(complaintId);
      setData(res);
      setRemarks('');
    } catch (err) {
      addToast(err.message || 'Failed to update status', 'error');
    } finally {
      setSaving(false);
    }
  };

  const complaint = data?.complaint;
  const history = data?.history || [];
  const isAdmin = user?.role === 'admin';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[1px]">
      <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-6 shadow-lg relative text-slate-900 max-h-[90vh] overflow-y-auto animate-modal">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="font-mono font-semibold text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              {complaint ? `#${complaint.complaint_id}` : 'Ticket'}
            </span>
            {complaint && (
              <>
                <StatusBadge status={complaint.status} size="xs" />
                <PriorityBadge priority={complaint.priority} size="xs" />
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-sm font-semibold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            Loading ticket details...
          </div>
        ) : !complaint ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            Unable to locate complaint details.
          </div>
        ) : (
          <div className="mt-4 space-y-4 text-xs">
            
            {/* Location & Metadata Box */}
            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg space-y-1">
              <div className="font-semibold text-slate-900 text-sm">
                {complaint.category}
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-600 text-xs pt-1">
                <div>
                  <span className="text-slate-400">Building:</span> {complaint.building}
                </div>
                <div>
                  <span className="text-slate-400">Room:</span> {complaint.room_number} ({complaint.floor})
                </div>
                <div>
                  <span className="text-slate-400">Reporter:</span> {complaint.reporter_name}
                </div>
                <div>
                  <span className="text-slate-400">Date:</span> {new Date(complaint.created_date).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <span className="block text-slate-500 font-medium mb-1">Problem Description:</span>
              <div className="p-3 bg-white border border-slate-200 rounded-md text-slate-800 leading-relaxed text-xs">
                {complaint.description}
              </div>
            </div>

            {/* Attached Photo */}
            {complaint.image_url && (
              <div>
                <span className="block text-slate-500 font-medium mb-1">Attached Photo:</span>
                <div className="p-2 border border-slate-200 rounded-md bg-slate-50">
                  <a
                    href={complaint.image_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 font-medium hover:underline text-xs"
                  >
                    View Attached Image ↗
                  </a>
                </div>
              </div>
            )}

            {/* History */}
            {history.length > 0 && (
              <div>
                <span className="block text-slate-500 font-medium mb-1.5">Activity History:</span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {history.map((h, i) => (
                    <div key={i} className="p-2 bg-slate-50 border border-slate-100 rounded text-[11px] text-slate-700">
                      <div className="flex justify-between font-medium">
                        <span>Status: {h.new_status}</span>
                        <span className="text-slate-400">
                          {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {h.remarks && (
                        <div className="text-slate-500 mt-0.5">{h.remarks}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Admin Status Update Form */}
            {isAdmin && (
              <form onSubmit={handleUpdateStatus} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5">
                <span className="block text-slate-800 font-semibold text-xs">
                  Update Status & Action
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 text-[11px] mb-1">
                      New Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 text-xs focus:outline-none focus:border-blue-500"
                    >
                      <option value="Submitted">Submitted</option>
                      <option value="Under Review">Under Review</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 text-[11px] mb-1">
                      Resolution Remarks
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Repaired wiring"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="text-right pt-1">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded text-xs transition-colors cursor-pointer"
                  >
                    {saving ? 'Saving...' : 'Save Update'}
                  </button>
                </div>
              </form>
            )}

            {/* Close Button */}
            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded text-xs font-medium cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
