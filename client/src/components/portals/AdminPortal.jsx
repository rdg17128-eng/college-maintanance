import React, { useState, useEffect } from 'react';
import {
  Search,
  Building2,
  Eye,
  RefreshCw,
  Inbox
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../common/Badges';
import { CategoryIcon } from '../common/CategoryIcon';
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
  const submittedCount = complaints.filter(c => c.status === 'Submitted').length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress' || c.status === 'Under Review' || c.status === 'Assigned').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Facilities Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Admin Portal — Monitor, update status, and manage campus complaints.
          </p>
        </div>

        <button
          onClick={fetchComplaints}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-all flex items-center justify-center gap-2 text-xs shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* 4 Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalCount}</div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">All campus requests</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider block">New / Review</span>
          <div className="text-2xl font-bold text-amber-600 mt-1">{submittedCount}</div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Awaiting action</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block">In Progress</span>
          <div className="text-2xl font-bold text-blue-600 mt-1">{inProgressCount}</div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Work underway</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider block">Resolved</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{resolvedCount}</div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Closed tickets</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto p-1 bg-slate-100 rounded-xl text-xs font-medium">
          {['All', 'Submitted', 'In Progress', 'Resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-white text-purple-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tickets, rooms, reporters..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-800 placeholder:text-slate-400"
          />
        </form>
      </div>

      {/* Complaints Table / List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs">
          <div className="w-7 h-7 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading administrative records...
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-slate-800 text-sm">No complaints found</h3>
          <p className="text-xs text-slate-400 mt-1">
            No complaints currently match your active filters.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Category & Location</th>
                  <th className="py-3 px-4">Reporter</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Update Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {complaints.map((c) => (
                  <tr key={c.complaint_id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* ID & Date */}
                    <td className="py-3 px-4">
                      <span className="font-mono font-semibold text-slate-900 block">
                        {c.complaint_id}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(c.created_date).toLocaleDateString()}
                      </span>
                    </td>

                    {/* Category & Location */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <CategoryIcon category={c.category} className="w-4 h-4 shrink-0" />
                        <div>
                          <div className="font-semibold text-slate-800">{c.category}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {c.building} — {c.room_number}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Reporter */}
                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-medium">{c.reporter_name}</div>
                      <span className={`inline-block text-[10px] px-1.5 py-0.2 rounded font-semibold capitalize ${
                        c.reporter_role === 'faculty' ? 'text-emerald-700 bg-emerald-50' : 'text-blue-700 bg-blue-50'
                      }`}>
                        {c.reporter_role}
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="py-3 px-4">
                      <PriorityBadge priority={c.priority} size="xs" />
                    </td>

                    {/* Current Status Badge */}
                    <td className="py-3 px-4">
                      <StatusBadge status={c.status} size="xs" />
                    </td>

                    {/* Quick Status Select */}
                    <td className="py-3 px-4">
                      <select
                        value={c.status}
                        onChange={(e) => handleStatusChange(c.complaint_id, e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
                      >
                        <option value="Submitted">Submitted</option>
                        <option value="Under Review">Under Review</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedComplaintId(c.complaint_id)}
                        className="px-2.5 py-1 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-all"
                      >
                        <Eye className="w-3 h-3" />
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

      {/* Complaint Detail Modal */}
      <ComplaintDetailModal
        complaintId={selectedComplaintId}
        onClose={() => setSelectedComplaintId(null)}
        onRefresh={fetchComplaints}
      />

    </div>
  );
}
