const CAMPUS_LAT = 8.45401;     // replace with real campus latitude
const CAMPUS_LNG = -13.24322;  // replace with real campus longitude
const ALLOWED_RADIUS = 1000;   // meters

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

const statusBox = document.getElementById("status");
const timerBox = document.getElementById("timer");
const form = document.getElementById("attendanceForm");
const button = form.querySelector("button");
const message = document.getElementById("message");

let countdown;

/* -------------------------------
   SIMULATED IP ADDRESS FUNCTION
-------------------------------- */
function getSimulatedIP() {
  let ip = localStorage.getItem("studentIP");
  if (!ip) {
    ip = "192.168.0." + Math.floor(Math.random() * 100);
    localStorage.setItem("studentIP", ip);
  }
  return ip;
}



function checkSession() {
  const session = JSON.parse(localStorage.getItem("attendanceSession"));

  if (!session) {
    closeAttendance();
    return;
  }

  const remaining = Math.floor((session.endTime - Date.now()) / 1000);

  if (remaining <= 0) {
    closeAttendance();
    return;
  }

  openAttendance(remaining);
}

function openAttendance(seconds) {
  statusBox.textContent = "Attendance is OPEN";
  statusBox.className = "status open";
  button.disabled = false;

  clearInterval(countdown);
  countdown = setInterval(() => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    timerBox.textContent = `${min}:${sec.toString().padStart(2, "0")}`;
    seconds--;
  }, 1000);
}

function closeAttendance() {
  statusBox.textContent = "Attendance is CLOSED";
  statusBox.className = "status closed";
  timerBox.textContent = "00:00";
  button.disabled = true;
  clearInterval(countdown);
}

form.onsubmit = e => {
  e.preventDefault();

  const session = JSON.parse(localStorage.getItem("attendanceSession"));
  if (!session) return;

  if (!navigator.geolocation) {
    message.textContent = "Geolocation is not supported on this device.";
    message.style.color = "red";
    return;
  }

  const records = JSON.parse(localStorage.getItem("attendanceRecords")) || [];
  const ipAddress = getSimulatedIP();

  /* -------------------------------
     IP RESTRICTION CHECK
  -------------------------------- */
  const ipExists = records.find(r => r.ip === ipAddress);
  if (ipExists) {
    message.textContent = "Attendance already submitted from this IP address.";
    message.style.color = "red";
    return;
  }

  message.textContent = "Detecting location...";
  message.style.color = "black";

  navigator.geolocation.getCurrentPosition(
    position => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      const distance = getDistance(
        CAMPUS_LAT,
        CAMPUS_LNG,
        lat,
        lng
      );

      if (distance > ALLOWED_RADIUS) {
        message.textContent = "You are outside the campus. Attendance denied.";
        message.style.color = "red";
        return;
      }

      const record = {
        fname: fname.value,
        id: studentId.value,
        className: className.value,
        ip: ipAddress,
        time: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString(),
        latitude: lat.toFixed(6),
        longitude: lng.toFixed(6),
        distance: Math.round(distance) + " m"
      };

      records.push(record);
      localStorage.setItem("attendanceRecords", JSON.stringify(records));

      message.textContent = "Attendance submitted successfully.";
      message.style.color = "green";
      button.disabled = true;
    },
    () => {
      message.textContent = "Location permission denied. Attendance not submitted.";
      message.style.color = "red";
    },
    { enableHighAccuracy: true }
  );
};

setInterval(checkSession, 1000);