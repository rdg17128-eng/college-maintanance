import React, { useState, useEffect } from 'react';
import { StatusBadge, PriorityBadge } from '../common/Badges';
import { ComplaintDetailModal } from '../complaints/ComplaintDetailModal';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export function AdminPortal() {
  const { addToast } = useToast();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const data = await api.getComplaints({
        status: statusFilter !== 'All' ? statusFilter : undefined,
        search: search.trim() || undefined
      });
      setComplaints(data);
    } catch (err) {
      addToast(err.message || 'Failed to load complaints', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchComplaints();
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.updateStatus(id, {
        status: newStatus,
        remarks: `Status updated to ${newStatus} by Administrator.`
      });
      addToast(`Ticket #${id} marked as ${newStatus}`, 'success');
      setComplaints(prev => prev.map(c => c.complaint_id === id ? { ...c, status: newStatus } : c));
    } catch (err) {
      addToast(err.message || 'Failed to update status', 'error');
    }
  };

  // Metrics
  const totalCount = complaints.length;
  const submittedCount = complaints.filter(c => c.status === 'Submitted' || c.status === 'Under Review').length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress' || c.status === 'Assigned').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Facilities Command Center (Admin)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Overview of campus maintenance tickets, triage, and updates.
          </p>
        </div>

        <button
          onClick={fetchComplaints}
          className="inline-flex items-center justify-center px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-medium border border-slate-200 rounded-lg text-xs shadow-2xs transition-colors cursor-pointer"
        >
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Total Tickets</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">All campus requests</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-2xs">
          <div className="text-xs font-medium text-slate-500">New / Review</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{submittedCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Awaiting triage</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-2xs">
          <div className="text-xs font-medium text-slate-500">In Progress</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">{inProgressCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Work underway</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Resolved</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{resolvedCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Closed tickets</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['All', 'Submitted', 'In Progress', 'Resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="w-full sm:w-72 flex gap-2">
          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium rounded-md transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {/* Complaints Table */}
      <section>
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs bg-white border border-slate-200 rounded-lg">
            Loading tickets...
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-lg">
            <h3 className="font-semibold text-sm text-slate-800">No tickets found</h3>
            <p className="text-xs text-slate-500 mt-1">
              No tickets matched the current filter criteria.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px] font-semibold">
                    <th className="py-3 px-4">Ticket</th>
                    <th className="py-3 px-4">Category & Location</th>
                    <th className="py-3 px-4">Reporter</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Quick Update</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {complaints.map((c) => (
                    <tr key={c.complaint_id} className="hover:bg-slate-50 transition-colors">
                      
                      <td className="py-3 px-4">
                        <span className="font-mono font-semibold text-slate-800 block">
                          #{c.complaint_id}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(c.created_date).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{c.category}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {c.building} • Room {c.room_number}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{c.reporter_name}</div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400">
                          {c.reporter_role}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <PriorityBadge priority={c.priority} size="xs" />
                      </td>

                      <td className="py-3 px-4">
                        <StatusBadge status={c.status} size="xs" />
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={c.status}
                          onChange={(e) => handleStatusChange(c.complaint_id, e.target.value)}
                          className="bg-white border border-slate-200 hover:border-slate-300 rounded px-2 py-1 text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                          <option value="Submitted">Submitted</option>
                          <option value="Under Review">Under Review</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedComplaintId(c.complaint_id)}
                          className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded text-xs font-medium transition-colors cursor-pointer"
                        >
                          Details
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Complaint Detail Modal */}
      <ComplaintDetailModal
        complaintId={selectedComplaintId}
        onClose={() => setSelectedComplaintId(null)}
        onRefresh={fetchComplaints}
      />

    </div>
  );
}
