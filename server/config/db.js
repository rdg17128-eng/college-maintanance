const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, '../../database.sqlite');
const uploadsDir = path.resolve(__dirname, '../../uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
  }
});

// Helper for db.run with Promise
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

// Helper for db.get with Promise
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// Helper for db.all with Promise
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function initDB() {
  // Create tables
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      user_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('student', 'faculty', 'admin')),
      department TEXT,
      reg_number TEXT,
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS complaints (
      complaint_id TEXT PRIMARY KEY,
      reporter_id TEXT NOT NULL,
      reporter_name TEXT NOT NULL,
      reporter_role TEXT NOT NULL CHECK(reporter_role IN ('student', 'faculty')),
      building TEXT NOT NULL,
      block TEXT,
      floor TEXT NOT NULL,
      room_number TEXT NOT NULL,
      room_type TEXT NOT NULL,
      department TEXT,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      image_url TEXT,
      priority TEXT NOT NULL CHECK(priority IN ('Low', 'Medium', 'High', 'Emergency')),
      status TEXT NOT NULL CHECK(status IN ('Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected')),
      assigned_staff TEXT,
      assigned_staff_phone TEXT,
      internal_notes TEXT,
      resolution_remarks TEXT,
      created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      target_date DATETIME,
      resolved_date DATETIME,
      FOREIGN KEY (reporter_id) REFERENCES users(user_id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS complaint_history (
      history_id INTEGER PRIMARY KEY AUTOINCREMENT,
      complaint_id TEXT NOT NULL,
      previous_status TEXT,
      new_status TEXT NOT NULL,
      updated_by TEXT NOT NULL,
      remarks TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (complaint_id) REFERENCES complaints(complaint_id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS notifications (
      notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      complaint_id TEXT,
      title TEXT,
      message TEXT NOT NULL,
      read_status INTEGER DEFAULT 0,
      created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS maintenance_staff (
      staff_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      status TEXT DEFAULT 'Available'
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  // Check if users exist; if not, seed default data
  const userCount = await get(`SELECT COUNT(*) as count FROM users`);
  if (userCount.count === 0) {
    console.log('Seeding initial demonstration database...');
    await seedData();
    console.log('Demonstration database seeded successfully.');
  }
}

async function seedData() {
  const salt = bcrypt.genSaltSync(10);
  const studentPwd = bcrypt.hashSync('student123', salt);
  const facultyPwd = bcrypt.hashSync('faculty123', salt);
  const adminPwd = bcrypt.hashSync('admin123', salt);

  // Users
  await run(`
    INSERT INTO users (user_id, name, email, password, role, department, reg_number, avatar_url)
    VALUES 
    ('usr-stu-101', 'Rahul Sharma', 'student@apexcollege.edu', ?, 'student', 'Computer Science & Engineering', '22CS104', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'),
    ('usr-stu-102', 'Aarav Patel', 'aarav.patel@apexcollege.edu', ?, 'student', 'Artificial Intelligence & ML', '23AI089', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
    ('usr-fac-201', 'Dr. Priya Nair', 'faculty@apexcollege.edu', ?, 'faculty', 'Artificial Intelligence & ML', 'FAC-AIML-409', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'),
    ('usr-fac-202', 'Prof. Vikram Sen', 'vikram.sen@apexcollege.edu', ?, 'faculty', 'Electronics & Comm. Engg', 'FAC-ECE-215', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),
    ('usr-adm-001', 'Apex Administration', 'admin@apexcollege.edu', ?, 'admin', 'Campus Infrastructure & Facilities', 'ADMIN-SYS-01', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150')
  `, [studentPwd, studentPwd, facultyPwd, facultyPwd, adminPwd]);

  // Maintenance Staff
  await run(`
    INSERT INTO maintenance_staff (staff_id, name, role, phone, email, status)
    VALUES
    ('stf-01', 'Rajesh Kumar', 'Senior Electrician', '+91 98450 12345', 'rajesh.electric@apexcollege.edu', 'Available'),
    ('stf-02', 'Suresh Babu', 'HVAC & AC Technician', '+91 98450 23456', 'suresh.ac@apexcollege.edu', 'Available'),
    ('stf-03', 'Manoj Gowda', 'Master Plumber', '+91 98450 34567', 'manoj.plumb@apexcollege.edu', 'Available'),
    ('stf-04', 'Anita Roy', 'Network & Systems Specialist', '+91 98450 45678', 'anita.net@apexcollege.edu', 'Busy'),
    ('stf-05', 'Karthik Verma', 'Furniture & Carpentry Lead', '+91 98450 56789', 'karthik.wood@apexcollege.edu', 'Available'),
    ('stf-06', 'Lakshmi Devi', 'Hygiene & Housekeeping Supervisor', '+91 98450 67890', 'lakshmi.cleaning@apexcollege.edu', 'Available')
  `);

  // Pre-seed sample complaints
  const initialComplaints = [
    {
      id: 'CMP-2026-001',
      reporterId: 'usr-stu-101',
      reporterName: 'Rahul Sharma',
      reporterRole: 'student',
      building: 'APJ Abdul Kalam Science Block',
      block: 'Block B',
      floor: '3rd Floor',
      roomNumber: 'Lab 304',
      roomType: 'Computer Lab',
      department: 'Computer Science & Engineering',
      category: 'Computer or Lab Equipment',
      description: 'Multiple desktop units (Systems 14, 15, and 16) are not powering on due to burnt power supply cables under desk row 3.',
      imageUrl: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=600',
      priority: 'High',
      status: 'In Progress',
      assignedStaff: 'Anita Roy (Network & Systems Specialist)',
      assignedPhone: '+91 98450 45678',
      internalNotes: 'Anita inspected on Oct 24. Replacement SMPS ordered from campus inventory.',
      resolutionRemarks: 'Replacement units arrived. Power supply installation in progress.',
      createdDate: '2026-10-23 10:15:00',
      updatedDate: '2026-10-24 14:30:00'
    },
    {
      id: 'CMP-2026-002',
      reporterId: 'usr-fac-201',
      reporterName: 'Dr. Priya Nair',
      reporterRole: 'faculty',
      building: 'Sir M. Visvesvaraya Tech Tower',
      block: 'Block A',
      floor: '4th Floor',
      roomNumber: 'Seminar Hall 401',
      roomType: 'Seminar Hall',
      department: 'Artificial Intelligence & ML',
      category: 'Fan or Air Conditioning',
      description: 'Ceiling cassette AC unit 2 is leaking condensation water onto faculty seating row and creating a puddle.',
      imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600',
      priority: 'Emergency',
      status: 'Assigned',
      assignedStaff: 'Suresh Babu (HVAC & AC Technician)',
      assignedPhone: '+91 98450 23456',
      internalNotes: 'Scheduled immediate check before 2 PM guest lecture.',
      resolutionRemarks: 'Assigned to HVAC team with high priority ticket.',
      createdDate: '2026-10-25 09:00:00',
      updatedDate: '2026-10-25 09:45:00'
    },
    {
      id: 'CMP-2026-003',
      reporterId: 'usr-stu-101',
      reporterName: 'Rahul Sharma',
      reporterRole: 'student',
      building: 'Ramanujan Academic Complex',
      block: 'Block C',
      floor: '2nd Floor',
      roomNumber: 'Room 212',
      roomType: 'Classroom',
      department: 'Computer Science & Engineering',
      category: 'Electrical',
      description: 'Tube lights on the whiteboard side are flickering violently, making it difficult to read lecture notes.',
      imageUrl: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600',
      priority: 'Medium',
      status: 'Resolved',
      assignedStaff: 'Rajesh Kumar (Senior Electrician)',
      assignedPhone: '+91 98450 12345',
      internalNotes: 'Choke and LED starter replaced on 24th Oct.',
      resolutionRemarks: 'Replaced defective fluorescent ballast with energy-efficient Philips LED tube batten. Checked and verified functional.',
      createdDate: '2026-10-21 11:20:00',
      updatedDate: '2026-10-22 16:00:00',
      resolvedDate: '2026-10-22 16:00:00'
    },
    {
      id: 'CMP-2026-004',
      reporterId: 'usr-fac-202',
      reporterName: 'Prof. Vikram Sen',
      reporterRole: 'faculty',
      building: 'Sir M. Visvesvaraya Tech Tower',
      block: 'Block B',
      floor: '1st Floor',
      roomNumber: 'Faculty Cabin 108',
      roomType: 'Faculty Room',
      department: 'Electronics & Comm. Engg',
      category: 'Internet or Network',
      description: 'LAN port wall socket in cabin 108 is damaged. Wi-Fi signal is too weak inside the cabin for online research meetings.',
      imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600',
      priority: 'High',
      status: 'Under Review',
      assignedStaff: null,
      assignedPhone: null,
      internalNotes: 'Needs RJ45 faceplate replacement and switch port reactivation.',
      resolutionRemarks: null,
      createdDate: '2026-10-25 14:10:00',
      updatedDate: '2026-10-25 14:10:00'
    },
    {
      id: 'CMP-2026-005',
      reporterId: 'usr-stu-102',
      reporterName: 'Aarav Patel',
      reporterRole: 'student',
      building: 'Central Library Building',
      block: 'Central Wing',
      floor: '1st Floor',
      roomNumber: 'Reference Section',
      roomType: 'Library',
      department: 'General / Campus Facilities',
      category: 'Plumbing',
      description: 'Men’s restroom on the 1st floor has a continuous faucet overflow from the center washbasin.',
      imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600',
      priority: 'Emergency',
      status: 'In Progress',
      assignedStaff: 'Manoj Gowda (Master Plumber)',
      assignedPhone: '+91 98450 34567',
      internalNotes: 'Main stopcock closed temporarily to prevent water wastage.',
      resolutionRemarks: 'Plumber on site fixing valve spindle.',
      createdDate: '2026-10-25 08:30:00',
      updatedDate: '2026-10-25 10:00:00'
    },
    {
      id: 'CMP-2026-006',
      reporterId: 'usr-fac-201',
      reporterName: 'Dr. Priya Nair',
      reporterRole: 'faculty',
      building: 'Sir M. Visvesvaraya Tech Tower',
      block: 'Block A',
      floor: '3rd Floor',
      roomNumber: 'AIML Research Lab',
      roomType: 'Laboratory',
      department: 'Artificial Intelligence & ML',
      category: 'Furniture and Equipment',
      description: 'Three ergonomic high-back chairs have broken hydraulic cylinders and do not hold height.',
      imageUrl: 'https://images.unsplash.com/photo-1580481077197-28565b1cdb1c?w=600',
      priority: 'Low',
      status: 'Submitted',
      assignedStaff: null,
      assignedPhone: null,
      internalNotes: null,
      resolutionRemarks: null,
      createdDate: '2026-10-26 08:45:00',
      updatedDate: '2026-10-26 08:45:00'
    }
  ];

  for (const c of initialComplaints) {
    await run(`
      INSERT INTO complaints (
        complaint_id, reporter_id, reporter_name, reporter_role,
        building, block, floor, room_number, room_type, department,
        category, description, image_url, priority, status,
        assigned_staff, assigned_staff_phone, internal_notes, resolution_remarks,
        created_date, updated_date, resolved_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      c.id, c.reporterId, c.reporterName, c.reporterRole,
      c.building, c.block, c.floor, c.roomNumber, c.roomType, c.department,
      c.category, c.description, c.imageUrl, c.priority, c.status,
      c.assignedStaff, c.assignedPhone, c.internalNotes, c.resolutionRemarks,
      c.createdDate, c.updatedDate, c.resolvedDate || null
    ]);

    // Add history entries
    await run(`
      INSERT INTO complaint_history (complaint_id, previous_status, new_status, updated_by, remarks, timestamp)
      VALUES (?, NULL, 'Submitted', ?, 'Complaint submitted via portal', ?)
    `, [c.id, c.reporterName, c.createdDate]);

    if (c.status !== 'Submitted') {
      await run(`
        INSERT INTO complaint_history (complaint_id, previous_status, new_status, updated_by, remarks, timestamp)
        VALUES (?, 'Submitted', ?, 'Admin Facility Office', ?, ?)
      `, [c.id, c.status, c.resolutionRemarks || `Status updated to ${c.status}`, c.updatedDate]);
    }
  }

  // Pre-seed notifications
  await run(`
    INSERT INTO notifications (user_id, complaint_id, title, message, read_status, created_date)
    VALUES
    ('usr-stu-101', 'CMP-2026-003', 'Issue Resolved', 'Your complaint CMP-2026-003 for Classroom 212 tube light has been verified & marked RESOLVED.', 0, '2026-10-22 16:05:00'),
    ('usr-stu-101', 'CMP-2026-001', 'Staff Assigned', 'Technician Anita Roy has been assigned to your Computer Lab 304 issue (CMP-2026-001).', 1, '2026-10-24 14:30:00'),
    ('usr-fac-201', 'CMP-2026-002', 'High Priority Assigned', 'HVAC Technician Suresh Babu dispatched for Seminar Hall 401 AC leakage (CMP-2026-002).', 0, '2026-10-25 09:45:00')
  `);

  // Settings
  await run(`
    INSERT INTO settings (key, value)
    VALUES 
    ('college_name', 'Apex Institute of Technology'),
    ('campus_tagline', 'Excellence in Engineering & Campus Living'),
    ('admin_email', 'facilities@apexcollege.edu'),
    ('emergency_helpline', '+91 80 2345 6789'),
    ('auto_assignment', 'true')
  `);
}

module.exports = {
  db,
  run,
  get,
  all,
  initDB
};
