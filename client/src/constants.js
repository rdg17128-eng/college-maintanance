export const BUILDINGS = [
  {
    name: 'APJ Abdul Kalam Science Block',
    blocks: ['Block A', 'Block B', 'Block C'],
    floors: ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor']
  },
  {
    name: 'Sir M. Visvesvaraya Tech Tower',
    blocks: ['Block A', 'Block B'],
    floors: ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor', '5th Floor']
  },
  {
    name: 'Ramanujan Academic Complex',
    blocks: ['Block C', 'Block D'],
    floors: ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor']
  },
  {
    name: 'Central Library Building',
    blocks: ['Central Wing', 'North Wing', 'Digital Annex'],
    floors: ['Ground Floor', '1st Floor', '2nd Floor']
  },
  {
    name: 'Admin & Examination Block',
    blocks: ['Main Wing', 'Registrar Annex'],
    floors: ['Ground Floor', '1st Floor', '2nd Floor']
  },
  {
    name: 'Sports & Gymnasium Arena',
    blocks: ['Indoor Complex', 'Outdoor Pavilion'],
    floors: ['Ground Floor', '1st Floor']
  },
  {
    name: 'Main Dining & Food Court',
    blocks: ['Cafeteria Wing', 'Student Lounge'],
    floors: ['Ground Floor', '1st Floor']
  }
];

export const ROOM_TYPES = [
  'Classroom',
  'Computer Lab',
  'Science Lab',
  'Library',
  'Seminar Hall',
  'Washroom',
  'Corridor',
  'Faculty Room',
  'Department Room',
  'Staff Room',
  'Other'
];

export const CATEGORIES = [
  { id: 'Electrical', label: 'Electrical', icon: 'Zap', desc: 'Lights, switches, power sockets, short circuits' },
  { id: 'Plumbing', label: 'Plumbing', icon: 'Droplets', desc: 'Leaking taps, blocked drains, flush valves' },
  { id: 'Cleaning and Hygiene', label: 'Cleaning and Hygiene', icon: 'Sparkles', desc: 'Waste disposal, restroom sanitization, mopping' },
  { id: 'Fan or Air Conditioning', label: 'Fan or Air Conditioning', icon: 'Wind', desc: 'AC cooling failure, ceiling fans, thermostats' },
  { id: 'Furniture and Equipment', label: 'Furniture and Equipment', icon: 'Armchair', desc: 'Desks, broken chairs, whiteboards, podiums' },
  { id: 'Computer or Lab Equipment', label: 'Computer or Lab Equipment', icon: 'Monitor', desc: 'Desktop PCs, projectors, lab apparatus' },
  { id: 'Water Supply', label: 'Water Supply', icon: 'GlassWater', desc: 'Drinking water coolers, overhead tanks, purifiers' },
  { id: 'Internet or Network', label: 'Internet or Network', icon: 'Wifi', desc: 'Wi-Fi access points, LAN sockets, switch failure' },
  { id: 'Other', label: 'Other', icon: 'HelpCircle', desc: 'Doors, windows, painting, general civil repair' }
];

export const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Artificial Intelligence & ML',
  'Electronics & Comm. Engg',
  'Electrical & Electronics Engg',
  'Mechanical Engineering',
  'Civil Engineering',
  'Information Technology',
  'Biotechnology',
  'General / Campus Facilities'
];

export const PRIORITIES = [
  { id: 'Low', label: 'Low', color: 'bg-slate-100 text-slate-700 border-slate-200', desc: 'Minor cosmetic or non-blocking issues' },
  { id: 'Medium', label: 'Medium', color: 'bg-blue-50 text-blue-700 border-blue-200', desc: 'Standard classroom/office repair' },
  { id: 'High', label: 'High', color: 'bg-amber-50 text-amber-700 border-amber-200', desc: 'Impacting lectures or lab experiments' },
  { id: 'Emergency', label: 'Emergency', color: 'bg-rose-50 text-rose-700 border-rose-300 font-bold', desc: 'Water flooding, electrical hazard, fire risk' }
];

export const STATUS_CONFIG = {
  'Submitted': {
    label: 'Submitted',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dot: 'bg-indigo-500',
    step: 1
  },
  'Under Review': {
    label: 'Under Review',
    color: 'bg-amber-50 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
    step: 2
  },
  'Assigned': {
    label: 'Assigned',
    color: 'bg-sky-50 text-sky-700 border-sky-200',
    dot: 'bg-sky-500',
    step: 3
  },
  'In Progress': {
    label: 'In Progress',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    dot: 'bg-purple-500',
    step: 4
  },
  'Resolved': {
    label: 'Resolved',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    step: 5
  },
  'Rejected': {
    label: 'Rejected',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
    step: 0
  }
};
