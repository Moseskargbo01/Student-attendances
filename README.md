# Smart Attendance System

A web-based attendance management system with role-based access for **Admins**, **Lecturers**, and **Students**. Attendance is verified using geolocation (campus radius check) and a simulated IP address to prevent duplicate submissions. All data is stored locally in the browser using `localStorage` — no backend or database is required to run it.

## Features

**Admin**
- Create, edit, enable/disable, and delete user accounts
- Assign roles: Admin, Lecturer, or Student
- Default admin account is created automatically on first run

**Lecturer**
- Start an attendance session (open for 10 minutes)
- Stop a session early at any time
- View live, auto-refreshing attendance records (name, ID, class, IP, time, GPS coordinates)

**Student**
- View real-time attendance status and countdown timer
- Submit attendance only while a session is open
- Location is checked against a fixed campus coordinate; submissions outside the allowed radius are rejected
- Duplicate submissions from the same (simulated) IP address are blocked

## File Structure

```
├── login.html          # Login screen and role-based redirect
├── login.css            # Login page styling
├── admin.html           # Admin dashboard (user management)
├── lecturer.html         # Lecturer dashboard (session control + records)
├── lecturer.js           # Lecturer logic (start/stop session, load records)
├── student.html          # Student attendance form
├── student.js            # Student logic (geolocation, distance check, submit)
└── style.css             # Shared styling for lecturer/student dashboards
```

## Getting Started

1. Download or clone all files into a single folder (keep file names unchanged, since the HTML files reference the CSS/JS by relative path).
2. Open `login.html` in a web browser.
3. Log in with the default admin account:
   - **Username:** `admin`
   - **Password:** `admin123`
4. From the Admin dashboard, create Lecturer and Student accounts as needed.

No installation, server, or build step is required — it runs entirely in the browser.

## How It Works

- **Login** checks credentials against a `users` list stored in `localStorage` and redirects to the matching dashboard (`admin.html`, `lecturer.html`, or `student.html`).
- **Attendance sessions** are represented by an `attendanceSession` object in `localStorage`, containing an `active` flag and an `endTime`. Lecturers create this when they click "Start Attendance"; it automatically expires after 10 minutes or when manually stopped.
- **Attendance records** are stored as an `attendanceRecords` array in `localStorage`. Students append a record (with browser geolocation coordinates) when they submit, and the Lecturer dashboard polls this list every second to display live updates.
- **Location verification** uses the Haversine formula to calculate the distance between the student's GPS position and a fixed campus coordinate, rejecting submissions beyond a configurable radius (default: 1000 meters).

## Configuration

Campus location and allowed radius can be adjusted at the top of `student.js`:

```javascript
const CAMPUS_LAT = 8.45401;
const CAMPUS_LNG = -13.24322;
const ALLOWED_RADIUS = 1000; // meters
```

Session duration can be adjusted in `lecturer.js`:

```javascript
const DURATION = 10 * 60 * 1000; // 10 minutes
```

## Limitations

- **Local storage only**: All data (users, sessions, records) lives in the browser's `localStorage`, so it is per-browser/per-device and is not shared across different computers or persisted on a server.
- **Simulated IP address**: Since this is a static front-end app, there is no real server to read a client's actual IP. A random IP-like value is generated once and stored locally to simulate per-device duplicate detection.
- **Passwords stored in plain text**: User passwords are stored unencrypted in `localStorage`, which is acceptable for a coursework/demo prototype but not for production use.
- **No real backend**: There is no database, authentication server, or API; this project is intended as a front-end prototype/demo of the attendance workflow.

## Possible Improvements

- Replace `localStorage` with a real backend (e.g., Node.js + database) for multi-device, multi-user support
- Hash and salt passwords instead of storing them in plain text
- Replace the simulated IP with server-side IP detection
- Add class/course-specific sessions instead of a single global session
- Export attendance records to CSV/Excel for reporting

## Tech Stack

- HTML5, CSS3, vanilla JavaScript (no frameworks or external libraries)
- Browser `localStorage` for data persistence
- Browser Geolocation API for location verification
