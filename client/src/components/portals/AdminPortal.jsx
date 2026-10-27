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
    <div className="space-y-6">
      
      {/* SECTION 1: Top Banner - Text Only */}
      <section className="p-6 bg-violet-50 border border-violet-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Facilities Command Center (Admin)
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Overview of all campus maintenance tickets, status updates, and reports.
          </p>
        </div>

        <button
          onClick={fetchComplaints}
          className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 font-bold border border-slate-300 rounded text-xs cursor-pointer"
        >
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </section>

      {/* SECTION 2: 4 Metric Cards - Text Only */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Sky Card: Total */}
        <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl">
          <div className="text-xs font-bold text-sky-800 uppercase tracking-wide">Total Tickets</div>
          <div className="text-2xl font-bold text-sky-950 mt-1">{totalCount}</div>
          <div className="text-[11px] text-sky-700 mt-0.5">All campus requests</div>
        </div>

        {/* Amber Card: New/Review */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="text-xs font-bold text-amber-800 uppercase tracking-wide">New / Review</div>
          <div className="text-2xl font-bold text-amber-950 mt-1">{submittedCount}</div>
          <div className="text-[11px] text-amber-700 mt-0.5">Awaiting triage</div>
        </div>

        {/* Lavender Card: In Progress */}
        <div className="p-4 bg-violet-50 border border-violet-200 rounded-xl">
          <div className="text-xs font-bold text-violet-800 uppercase tracking-wide">In Progress</div>
          <div className="text-2xl font-bold text-violet-950 mt-1">{inProgressCount}</div>
          <div className="text-[11px] text-violet-700 mt-0.5">Work underway</div>
        </div>

        {/* Mint Card: Resolved */}
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Resolved</div>
          <div className="text-2xl font-bold text-emerald-950 mt-1">{resolvedCount}</div>
          <div className="text-[11px] text-emerald-700 mt-0.5">Closed tickets</div>
        </div>

      </section>

      {/* SECTION 3: Filter & Search Bar - Text Only */}
      <section className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto p-1 bg-slate-100 rounded-lg text-xs font-bold">
          {['All', 'Submitted', 'In Progress', 'Resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded cursor-pointer ${
                statusFilter === st
                  ? 'bg-violet-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
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
            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-violet-500"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded cursor-pointer"
          >
            Search
          </button>
        </form>
      </section>

      {/* SECTION 4: Complaints Table - Text Only */}
      <section>
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs bg-white border border-slate-200 rounded-xl">
            Loading administrative records...
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-xl text-slate-600">
            <h3 className="font-bold text-sm">No complaints found</h3>
            <p className="text-xs text-slate-400 mt-1">
              No tickets matched the current filter criteria.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px] font-bold">
                    <th className="py-3 px-4">Ticket ID</th>
                    <th className="py-3 px-4">Category & Location</th>
                    <th className="py-3 px-4">Reporter</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Change Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {complaints.map((c) => (
                    <tr key={c.complaint_id} className="hover:bg-slate-50">
                      
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-violet-700 block">
                          {c.complaint_id}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(c.created_date).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{c.category}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {c.building} - {c.room_number}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-slate-800">{c.reporter_name}</div>
                        <span className="text-[10px] font-bold uppercase text-slate-500">
                          Role: {c.reporter_role}
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
                          className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:border-violet-500 cursor-pointer"
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
                          className="px-3 py-1 bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 rounded text-xs font-bold cursor-pointer"
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
