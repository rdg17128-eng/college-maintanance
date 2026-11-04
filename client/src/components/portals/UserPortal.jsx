import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, PriorityBadge } from '../common/Badges';
import { ComplaintFormModal } from '../complaints/ComplaintFormModal';
import { ComplaintDetailModal } from '../complaints/ComplaintDetailModal';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export function UserPortal() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
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

  const activeCount = complaints.filter(c => c.status !== 'Resolved' && c.status !== 'Rejected').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Maintenance Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Welcome back, <span className="font-semibold text-slate-700">{user?.name}</span>. Track issues and report repairs.
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-xs shadow-xs transition-colors cursor-pointer"
          id="report-issue-btn"
        >
          + Report Issue
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Total Tickets</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{complaints.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Submitted requests</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-2xs">
          <div className="text-xs font-medium text-slate-500">In Progress</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">{activeCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Currently being repaired</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Resolved</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{resolvedCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Successfully closed</div>
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
            placeholder="Search complaints..."
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

      {/* Complaints List / Grid */}
      <section>
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs bg-white border border-slate-200 rounded-lg">
            Loading complaints...
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-lg">
            <h3 className="font-semibold text-sm text-slate-800">No complaints found</h3>
            <p className="text-xs text-slate-500 mt-1">
              There are no records matching your current filter.
            </p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors cursor-pointer"
            >
              Report New Issue
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {complaints.map((item) => (
              <div
                key={item.complaint_id}
                onClick={() => setSelectedComplaintId(item.complaint_id)}
                className="bg-white border border-slate-200 hover:border-slate-300 hover:shadow-2xs p-4 rounded-lg cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      #{item.complaint_id}
                    </span>
                    <div className="flex gap-1.5">
                      <StatusBadge status={item.status} size="xs" />
                      <PriorityBadge priority={item.priority} size="xs" />
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-900 mt-1">
                    {item.category} • Room {item.room_number}
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {item.building} ({item.floor})
                  </div>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                    {item.description}
                  </p>

                  {item.resolution_remarks && (
                    <div className="mt-2.5 p-2 bg-emerald-50 border border-emerald-100 rounded text-[11px] text-emerald-800">
                      <strong>Resolution Note:</strong> {item.resolution_remarks}
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Reported: {new Date(item.created_date).toLocaleDateString()}</span>
                  <span className="text-blue-600 font-medium hover:underline">
                    View Details →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modals */}
      <ComplaintFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={fetchComplaints}
      />

      <ComplaintDetailModal
        complaintId={selectedComplaintId}
        onClose={() => setSelectedComplaintId(null)}
        onRefresh={fetchComplaints}
      />

    </div>
  );
}
