import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../common/Badges';
import { CategoryIcon } from '../common/CategoryIcon';
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
      
      // Refresh modal data
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-xl w-full p-6 shadow-2xl relative text-slate-800 animate-in fade-in duration-200 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm text-slate-900">
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
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading ticket details...
          </div>
        ) : !complaint ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            Unable to locate complaint details.
          </div>
        ) : (
          <div className="mt-4 space-y-5 text-xs">
            
            {/* Location & Category Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2">
                <CategoryIcon category={complaint.category} className="w-4 h-4 shrink-0" />
                <span className="font-semibold text-slate-800 text-sm">{complaint.category}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-600 text-[11px] pt-1">
                <div>
                  <span className="text-slate-400 block">Location:</span>
                  <span className="font-medium text-slate-800">{complaint.building}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Room & Floor:</span>
                  <span className="font-medium text-slate-800">{complaint.room_number} ({complaint.floor})</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Reported By:</span>
                  <span className="font-medium text-slate-800">{complaint.reporter_name} ({complaint.reporter_role})</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Date Logged:</span>
                  <span className="font-medium text-slate-800">
                    {new Date(complaint.created_date).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <span className="font-semibold text-slate-700 block mb-1">
                Problem Description
              </span>
              <div className="p-3 bg-white border border-slate-200 rounded-xl text-slate-700 leading-relaxed font-medium">
                {complaint.description}
              </div>
            </div>

            {/* Attached Photo */}
            {complaint.image_url && (
              <div>
                <span className="font-semibold text-slate-700 block mb-1">
                  Attached Photo
                </span>
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 max-h-56 flex items-center justify-center">
                  <img
                    src={complaint.image_url}
                    alt="Maintenance issue"
                    className="object-contain max-h-56 w-full"
                  />
                  <a
                    href={complaint.image_url}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-semibold text-slate-700 border border-slate-200 shadow-xs flex items-center gap-1 hover:text-blue-600"
                  >
                    Open Full <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            {/* History / Timeline */}
            <div>
              <span className="font-semibold text-slate-700 block mb-2">
                Activity History
              </span>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {history.map((h, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[11px]">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-slate-800 font-medium">
                        <span>Status: <strong className="text-blue-700">{h.new_status}</strong></span>
                        <span className="text-slate-400 text-[10px]">
                          {new Date(h.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {h.remarks && (
                        <p className="text-slate-500 mt-0.5">{h.remarks}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Status Update Form */}
            {isAdmin && (
              <form onSubmit={handleUpdateStatus} className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200 space-y-3">
                <span className="font-semibold text-purple-900 block text-xs">
                  Administrative Action: Update Status
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-700 font-medium text-[11px] mb-1">
                      Change Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    >
                      <option value="Submitted">Submitted</option>
                      <option value="Under Review">Under Review</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium text-[11px] mb-1">
                      Resolution Remarks (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Electrician fixed switch"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>
                </div>

                <div className="text-right">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl shadow-xs transition-all text-xs"
                  >
                    {saving ? 'Updating...' : 'Save Status'}
                  </button>
                </div>
              </form>
            )}

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
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
