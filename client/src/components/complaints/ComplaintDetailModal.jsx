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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-lg border border-sky-300 max-w-xl w-full p-6 shadow-md relative text-black max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-sky-200">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm text-black bg-sky-100 px-2.5 py-0.5 rounded border border-sky-300">
              {complaint ? complaint.complaint_id : 'Ticket Details'}
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
            className="px-2.5 py-1 text-black bg-white hover:bg-sky-50 rounded border border-sky-300 text-xs font-bold cursor-pointer"
          >
            Close
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-black text-xs">
            Loading ticket details...
          </div>
        ) : !complaint ? (
          <div className="py-8 text-center text-black text-xs">
            Unable to locate complaint details.
          </div>
        ) : (
          <div className="mt-4 space-y-4 text-xs">
            
            {/* Location & Metadata Box */}
            <div className="p-4 bg-sky-50 border border-sky-300 rounded space-y-1.5">
              <div className="font-bold text-black text-sm">
                Category: {complaint.category}
              </div>
              <div className="grid grid-cols-2 gap-2 text-black text-xs pt-1">
                <div>
                  <strong>Building:</strong> {complaint.building}
                </div>
                <div>
                  <strong>Room & Floor:</strong> {complaint.room_number} ({complaint.floor})
                </div>
                <div>
                  <strong>Reported By:</strong> {complaint.reporter_name} ({complaint.reporter_role})
                </div>
                <div>
                  <strong>Date:</strong> {new Date(complaint.created_date).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <strong className="block text-black mb-1">Problem Description:</strong>
              <div className="p-3 bg-white border border-sky-200 rounded text-black leading-relaxed">
                {complaint.description}
              </div>
            </div>

            {/* Attached Photo */}
            {complaint.image_url && (
              <div>
                <strong className="block text-black mb-1">Attached Photo:</strong>
                <div className="p-2 border border-sky-200 rounded bg-white">
                  <a
                    href={complaint.image_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-600 font-bold hover:underline"
                  >
                    [View Full Image]
                  </a>
                </div>
              </div>
            )}

            {/* History */}
            <div>
              <strong className="block text-black mb-2">Activity Timeline:</strong>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {history.map((h, i) => (
                  <div key={i} className="p-2 bg-sky-50 border border-sky-200 rounded text-[11px] text-black">
                    <div className="flex justify-between font-bold text-black">
                      <span>Status: {h.new_status}</span>
                      <span className="text-black font-normal">
                        {new Date(h.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {h.remarks && (
                      <div className="text-black mt-0.5">{h.remarks}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Status Update Form */}
            {isAdmin && (
              <form onSubmit={handleUpdateStatus} className="p-4 bg-sky-50 border border-sky-300 rounded space-y-3">
                <strong className="block text-black text-xs">
                  Administrative Action: Update Status
                </strong>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-black font-bold text-[11px] mb-1">
                      Change Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full bg-white border border-sky-300 rounded px-2 py-1 text-black font-semibold focus:outline-none focus:border-sky-600"
                    >
                      <option value="Submitted">Submitted</option>
                      <option value="Under Review">Under Review</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-black font-bold text-[11px] mb-1">
                      Resolution Note (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Technician repaired wiring"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="w-full bg-white border border-sky-300 rounded px-2 py-1 text-black focus:outline-none focus:border-sky-600"
                    />
                  </div>
                </div>

                <div className="text-right">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-1.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded text-xs cursor-pointer"
                  >
                    {saving ? 'Saving...' : 'Save Status'}
                  </button>
                </div>
              </form>
            )}

            {/* Close Button */}
            <div className="pt-3 border-t border-sky-200 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 bg-white hover:bg-sky-50 text-black border border-sky-300 rounded font-bold text-xs cursor-pointer"
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
