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
    <div className="space-y-6">
      
      {/* SECTION 1: Header Banner - Text Only */}
      <section className="p-6 bg-sky-50 border border-sky-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Maintenance Dashboard
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Welcome, <span className="font-bold">{user?.name}</span>. Report campus maintenance issues or view status.
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg text-xs cursor-pointer"
          id="report-issue-btn"
        >
          + Report Issue
        </button>
      </section>

      {/* SECTION 2: 3 Metric Cards - 3 Light Colors, Text Only */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Light Color 1: Sky */}
        <div className="p-5 bg-sky-50 border border-sky-200 rounded-xl">
          <div className="text-xs font-bold text-sky-800 uppercase tracking-wider">
            Total Tickets
          </div>
          <div className="text-3xl font-bold text-sky-950 mt-2">
            {complaints.length}
          </div>
          <div className="text-[11px] text-sky-700 mt-1">
            All submitted requests
          </div>
        </div>

        {/* Light Color 2: Lavender */}
        <div className="p-5 bg-violet-50 border border-violet-200 rounded-xl">
          <div className="text-xs font-bold text-violet-800 uppercase tracking-wider">
            In Progress
          </div>
          <div className="text-3xl font-bold text-violet-950 mt-2">
            {activeCount}
          </div>
          <div className="text-[11px] text-violet-700 mt-1">
            Work currently ongoing
          </div>
        </div>

        {/* Light Color 3: Mint */}
        <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
            Resolved
          </div>
          <div className="text-3xl font-bold text-emerald-950 mt-2">
            {resolvedCount}
          </div>
          <div className="text-[11px] text-emerald-700 mt-1">
            Successfully completed
          </div>
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
                  ? 'bg-sky-600 text-white'
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
            placeholder="Search complaints..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-sky-500"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded cursor-pointer"
          >
            Search
          </button>
        </form>
      </section>

      {/* SECTION 4: Complaints Feed - Text Only */}
      <section>
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs bg-white border border-slate-200 rounded-xl">
            Loading complaints data...
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-xl text-slate-600">
            <h3 className="font-bold text-sm">No complaints found</h3>
            <p className="text-xs text-slate-400 mt-1">
              There are no records matching your current filter.
            </p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="mt-4 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded cursor-pointer"
            >
              Report New Issue
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {complaints.map((item) => (
              <div
                key={item.complaint_id}
                onClick={() => setSelectedComplaintId(item.complaint_id)}
                className="bg-white border border-slate-200 hover:border-sky-400 p-5 rounded-xl cursor-pointer transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      ID: {item.complaint_id}
                    </span>
                    <div className="flex gap-1.5">
                      <StatusBadge status={item.status} size="xs" />
                      <PriorityBadge priority={item.priority} size="xs" />
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mt-2">
                    {item.category} - Room {item.room_number}
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Building: {item.building} | Floor: {item.floor}
                  </div>

                  <p className="text-xs text-slate-700 mt-2 line-clamp-2">
                    {item.description}
                  </p>

                  {item.resolution_remarks && (
                    <div className="mt-2.5 p-2 bg-emerald-50 border border-emerald-200 rounded text-[11px] text-emerald-800">
                      <strong>Resolution Note:</strong> {item.resolution_remarks}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Date: {new Date(item.created_date).toLocaleDateString()}</span>
                  <span className="text-sky-700 font-bold hover:underline">
                    View Details &gt;&gt;
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
