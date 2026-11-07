const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Complaint = require('../models/Complaint');
const ComplaintHistory = require('../models/ComplaintHistory');
const Notification = require('../models/Notification');
const MaintenanceStaff = require('../models/MaintenanceStaff');
const Setting = require('../models/Setting');

async function initDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campuscare';

  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB database at:', uri);

    // Check if initial users exist
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Seeding initial MongoDB database...');
      await seedData();
      console.log('Demonstration data seeded into MongoDB successfully.');
    }
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    throw err;
  }
}

async function seedData() {
  const salt = bcrypt.genSaltSync(10);
  const studentPwd = bcrypt.hashSync('student123', salt);
  const facultyPwd = bcrypt.hashSync('faculty123', salt);
  const adminPwd = bcrypt.hashSync('admin123', salt);

  // Users
  await User.insertMany([
    {
      user_id: 'usr-stu-101',
      name: 'Rahul Sharma',
      email: 'student@apexcollege.edu',
      password: studentPwd,
      role: 'student',
      department: 'Computer Science & Engineering',
      reg_number: '22CS104',
      avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'
    },
    {
      user_id: 'usr-stu-102',
      name: 'Aarav Patel',
      email: 'aarav.patel@apexcollege.edu',
      password: studentPwd,
      role: 'student',
      department: 'Artificial Intelligence & ML',
      reg_number: '23AI089',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
    },
    {
      user_id: 'usr-fac-201',
      name: 'Dr. Priya Nair',
      email: 'faculty@apexcollege.edu',
      password: facultyPwd,
      role: 'faculty',
      department: 'Artificial Intelligence & ML',
      reg_number: 'FAC-AIML-409',
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
    },
    {
      user_id: 'usr-fac-202',
      name: 'Prof. Vikram Sen',
      email: 'vikram.sen@apexcollege.edu',
      password: facultyPwd,
      role: 'faculty',
      department: 'Electronics & Comm. Engg',
      reg_number: 'FAC-ECE-215',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
    },
    {
      user_id: 'usr-adm-001',
      name: 'Apex Administration',
      email: 'admin@apexcollege.edu',
      password: adminPwd,
      role: 'admin',
      department: 'Campus Infrastructure & Facilities',
      reg_number: 'ADMIN-SYS-01',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
    }
  ]);

  // Maintenance Staff
  await MaintenanceStaff.insertMany([
    { staff_id: 'stf-01', name: 'Rajesh Kumar', role: 'Senior Electrician', phone: '+91 98450 12345', email: 'rajesh.electric@apexcollege.edu', status: 'Available' },
    { staff_id: 'stf-02', name: 'Suresh Babu', role: 'HVAC & AC Technician', phone: '+91 98450 23456', email: 'suresh.ac@apexcollege.edu', status: 'Available' },
    { staff_id: 'stf-03', name: 'Manoj Gowda', role: 'Master Plumber', phone: '+91 98450 34567', email: 'manoj.plumb@apexcollege.edu', status: 'Available' },
    { staff_id: 'stf-04', name: 'Anita Roy', role: 'Network & Systems Specialist', phone: '+91 98450 45678', email: 'anita.net@apexcollege.edu', status: 'Busy' },
    { staff_id: 'stf-05', name: 'Karthik Verma', role: 'Furniture & Carpentry Lead', phone: '+91 98450 56789', email: 'karthik.wood@apexcollege.edu', status: 'Available' },
    { staff_id: 'stf-06', name: 'Lakshmi Devi', role: 'Hygiene & Housekeeping Supervisor', phone: '+91 98450 67890', email: 'lakshmi.cleaning@apexcollege.edu', status: 'Available' }
  ]);

  // Pre-seed sample complaints
  const initialComplaints = [
    {
      complaint_id: 'CMP-2026-001',
      reporter_id: 'usr-stu-101',
      reporter_name: 'Rahul Sharma',
      reporter_role: 'student',
      building: 'APJ Abdul Kalam Science Block',
      block: 'Block B',
      floor: '3rd Floor',
      room_number: 'Lab 304',
      room_type: 'Computer Lab',
      department: 'Computer Science & Engineering',
      category: 'Computer or Lab Equipment',
      description: 'Multiple desktop units (Systems 14, 15, and 16) are not powering on due to burnt power supply cables under desk row 3.',
      image_url: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=600',
      priority: 'High',
      status: 'In Progress',
      assigned_staff: 'Anita Roy (Network & Systems Specialist)',
      assigned_staff_phone: '+91 98450 45678',
      internal_notes: 'Anita inspected on Oct 24. Replacement SMPS ordered from campus inventory.',
      resolution_remarks: 'Replacement units arrived. Power supply installation in progress.',
      created_date: new Date('2026-10-23T10:15:00Z'),
      updated_date: new Date('2026-10-24T14:30:00Z')
    },
    {
      complaint_id: 'CMP-2026-002',
      reporter_id: 'usr-fac-201',
      reporter_name: 'Dr. Priya Nair',
      reporter_role: 'faculty',
      building: 'Sir M. Visvesvaraya Tech Tower',
      block: 'Block A',
      floor: '4th Floor',
      room_number: 'Seminar Hall 401',
      room_type: 'Seminar Hall',
      department: 'Artificial Intelligence & ML',
      category: 'Fan or Air Conditioning',
      description: 'Ceiling cassette AC unit 2 is leaking condensation water onto faculty seating row and creating a puddle.',
      image_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600',
      priority: 'Emergency',
      status: 'Assigned',
      assigned_staff: 'Suresh Babu (HVAC & AC Technician)',
      assigned_staff_phone: '+91 98450 23456',
      internal_notes: 'Scheduled immediate check before 2 PM guest lecture.',
      resolution_remarks: 'Assigned to HVAC team with high priority ticket.',
      created_date: new Date('2026-10-25T09:00:00Z'),
      updated_date: new Date('2026-10-25T09:45:00Z')
    },
    {
      complaint_id: 'CMP-2026-003',
      reporter_id: 'usr-stu-101',
      reporter_name: 'Rahul Sharma',
      reporter_role: 'student',
      building: 'Ramanujan Academic Complex',
      block: 'Block C',
      floor: '2nd Floor',
      room_number: 'Room 212',
      room_type: 'Classroom',
      department: 'Computer Science & Engineering',
      category: 'Electrical',
      description: 'Tube lights on the whiteboard side are flickering violently, making it difficult to read lecture notes.',
      image_url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600',
      priority: 'Medium',
      status: 'Resolved',
      assigned_staff: 'Rajesh Kumar (Senior Electrician)',
      assigned_staff_phone: '+91 98450 12345',
      internal_notes: 'Choke and LED starter replaced on 24th Oct.',
      resolution_remarks: 'Replaced defective fluorescent ballast with energy-efficient Philips LED tube batten. Checked and verified functional.',
      created_date: new Date('2026-10-21T11:20:00Z'),
      updated_date: new Date('2026-10-22T16:00:00Z'),
      resolved_date: new Date('2026-10-22T16:00:00Z')
    },
    {
      complaint_id: 'CMP-2026-004',
      reporter_id: 'usr-fac-202',
      reporter_name: 'Prof. Vikram Sen',
      reporter_role: 'faculty',
      building: 'Sir M. Visvesvaraya Tech Tower',
      block: 'Block B',
      floor: '1st Floor',
      room_number: 'Faculty Cabin 108',
      room_type: 'Faculty Room',
      department: 'Electronics & Comm. Engg',
      category: 'Internet or Network',
      description: 'LAN port wall socket in cabin 108 is damaged. Wi-Fi signal is too weak inside the cabin for online research meetings.',
      image_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600',
      priority: 'High',
      status: 'Under Review',
      assigned_staff: null,
      assigned_staff_phone: null,
      internal_notes: 'Needs RJ45 faceplate replacement and switch port reactivation.',
      resolution_remarks: null,
      created_date: new Date('2026-10-25T14:10:00Z'),
      updated_date: new Date('2026-10-25T14:10:00Z')
    },
    {
      complaint_id: 'CMP-2026-005',
      reporter_id: 'usr-stu-102',
      reporter_name: 'Aarav Patel',
      reporter_role: 'student',
      building: 'Central Library Building',
      block: 'Central Wing',
      floor: '1st Floor',
      room_number: 'Reference Section',
      room_type: 'Library',
      department: 'General / Campus Facilities',
      category: 'Plumbing',
      description: 'Men’s restroom on the 1st floor has a continuous faucet overflow from the center washbasin.',
      image_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600',
      priority: 'Emergency',
      status: 'In Progress',
      assigned_staff: 'Manoj Gowda (Master Plumber)',
      assigned_staff_phone: '+91 98450 34567',
      internal_notes: 'Main stopcock closed temporarily to prevent water wastage.',
      resolution_remarks: 'Plumber on site fixing valve spindle.',
      created_date: new Date('2026-10-25T08:30:00Z'),
      updated_date: new Date('2026-10-25T10:00:00Z')
    },
    {
      complaint_id: 'CMP-2026-006',
      reporter_id: 'usr-fac-201',
      reporter_name: 'Dr. Priya Nair',
      reporter_role: 'faculty',
      building: 'Sir M. Visvesvaraya Tech Tower',
      block: 'Block A',
      floor: '3rd Floor',
      room_number: 'AIML Research Lab',
      room_type: 'Laboratory',
      department: 'Artificial Intelligence & ML',
      category: 'Furniture and Equipment',
      description: 'Three ergonomic high-back chairs have broken hydraulic cylinders and do not hold height.',
      image_url: 'https://images.unsplash.com/photo-1580481077197-28565b1cdb1c?w=600',
      priority: 'Low',
      status: 'Submitted',
      assigned_staff: null,
      assigned_staff_phone: null,
      internal_notes: null,
      resolution_remarks: null,
      created_date: new Date('2026-10-26T08:45:00Z'),
      updated_date: new Date('2026-10-26T08:45:00Z')
    }
  ];

  await Complaint.insertMany(initialComplaints);

  // Add initial history entries
  const historyEntries = [];
  for (const c of initialComplaints) {
    historyEntries.push({
      complaint_id: c.complaint_id,
      previous_status: null,
      new_status: 'Submitted',
      updated_by: c.reporter_name,
      remarks: 'Complaint submitted via portal',
      timestamp: c.created_date
    });

    if (c.status !== 'Submitted') {
      historyEntries.push({
        complaint_id: c.complaint_id,
        previous_status: 'Submitted',
        new_status: c.status,
        updated_by: 'Admin Facility Office',
        remarks: c.resolution_remarks || `Status updated to ${c.status}`,
        timestamp: c.updated_date
      });
    }
  }
  await ComplaintHistory.insertMany(historyEntries);

  // Pre-seed notifications
  await Notification.insertMany([
    {
      user_id: 'usr-stu-101',
      complaint_id: 'CMP-2026-003',
      title: 'Issue Resolved',
      message: 'Your complaint CMP-2026-003 for Classroom 212 tube light has been verified & marked RESOLVED.',
      read_status: 0,
      created_date: new Date('2026-10-22T16:05:00Z')
    },
    {
      user_id: 'usr-stu-101',
      complaint_id: 'CMP-2026-001',
      title: 'Staff Assigned',
      message: 'Technician Anita Roy has been assigned to your Computer Lab 304 issue (CMP-2026-001).',
      read_status: 1,
      created_date: new Date('2026-10-24T14:30:00Z')
    },
    {
      user_id: 'usr-fac-201',
      complaint_id: 'CMP-2026-002',
      title: 'High Priority Assigned',
      message: 'HVAC Technician Suresh Babu dispatched for Seminar Hall 401 AC leakage (CMP-2026-002).',
      read_status: 0,
      created_date: new Date('2026-10-25T09:45:00Z')
    }
  ]);

  // Settings
  await Setting.insertMany([
    { key: 'college_name', value: 'Apex Institute of Technology' },
    { key: 'campus_tagline', value: 'Excellence in Engineering & Campus Living' },
    { key: 'admin_email', value: 'facilities@apexcollege.edu' },
    { key: 'emergency_helpline', value: '+91 80 2345 6789' },
    { key: 'auto_assignment', value: 'true' }
  ]);
}

module.exports = {
  mongoose,
  initDB,
  User,
  Complaint,
  ComplaintHistory,
  Notification,
  MaintenanceStaff,
  Setting
};
