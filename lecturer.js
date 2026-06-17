const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const statusBox = document.getElementById("status");
const table = document.getElementById("attendanceTable");

const DURATION = 10 * 60 * 1000; // 10 minutes

function updateStatus(open) {
  if (open) {
    statusBox.textContent = "Attendance is OPEN";
    statusBox.className = "status open";
    startBtn.disabled = true;
    stopBtn.disabled = false;
  } else {
    statusBox.textContent = "Attendance is CLOSED";
    statusBox.className = "status closed";
    startBtn.disabled = false;
    stopBtn.disabled = true;
  }
}

// Start attendance session
startBtn.onclick = () => {
  const session = {
    active: true,
    endTime: Date.now() + DURATION
  };
  localStorage.setItem("attendanceSession", JSON.stringify(session));
  localStorage.setItem("attendanceRecords", JSON.stringify([]));
  updateStatus(true);
};

// Stop attendance session
stopBtn.onclick = () => {
  localStorage.removeItem("attendanceSession");
  updateStatus(false);
};

// FUNCTION TO ADD STUDENT ATTENDANCE WITH LOCATION
function submitAttendance(fname, id, className, ip) {
  const session = JSON.parse(localStorage.getItem("attendanceSession"));
  if (!session || Date.now() > session.endTime) {
    alert("Attendance is closed");
    return;
  }

  if (!navigator.geolocation) {
    alert("Location tracking is not supported by your browser");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    position => {
      const records = JSON.parse(localStorage.getItem("attendanceRecords")) || [];

      const record = {
        fname,
        id,
        className,
        ip,
        time: new Date().toLocaleString(),
        date: new Date().toLocaleDateString(),
        latitude: position.coords.latitude.toFixed(6),
        longitude: position.coords.longitude.toFixed(6)
      };

      records.push(record);
      localStorage.setItem("attendanceRecords", JSON.stringify(records));
      alert("Attendance submitted successfully");
    },
    error => {
      alert("Location permission denied. Attendance not submitted.");
    }
  );
}

// Load attendance records to lecturer table
function loadRecords() {
  table.innerHTML = "";
  const records = JSON.parse(localStorage.getItem("attendanceRecords")) || [];

  records.forEach(r => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${r.fname}</td>
      <td>${r.id}</td>
      <td>${r.className}</td>
      <td>${r.ip}</td>
      <td>${r.time}</td>
      <td>${r.date}</td>
      <td>${r.latitude}, ${r.longitude}</td>
    `;
    table.appendChild(row);
  });
}

// Auto-check session expiry and refresh table
setInterval(() => {
  const session = JSON.parse(localStorage.getItem("attendanceSession"));
  if (!session || Date.now() > session.endTime) {
    localStorage.removeItem("attendanceSession");
    updateStatus(false);
  }
  loadRecords();
}, 1000);