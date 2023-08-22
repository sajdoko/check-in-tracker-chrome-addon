// popup.js

// Function to format time as HH:MM:SS
function formatTime(time) {
  const [hours, minutes, seconds] = time.split(":");
  const formattedHours = hours.padStart(2, '0');
  const formattedMinutes = minutes.padStart(2, '0');
  const formattedSeconds = seconds.padStart(2, '0');
  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

// Function to calculate the difference between two times
function calculateTimeDifference(start, end) {
  const startTime = new Date(`2000-01-01T${start}`);
  const endTime = new Date(`2000-01-01T${end}`);
  const timeDiff = endTime - startTime;
  return timeDiff;
}

// Function to create and populate the table
function createTable(data) {
  let tableHTML =
    "<table><tr><th>User</th><th>Check In</th><th>Check Out</th></tr>";

  let totalMilliseconds = 0;

  data.forEach((item) => {
    // Add the last row if Operatore is still checked in
    if (item["oraUscita"] === "00:00:00") {
      const lastCheckIn = formatTime(item["oraEntrata"]);
      const checkOut = formatTime(item["oraUscita"]);
      const now = new Date();
      const currentTime = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
      totalMilliseconds += calculateTimeDifference(lastCheckIn, formatTime(currentTime));
      tableHTML += `<tr><td>${item["operatore"]}</td><td>${lastCheckIn}</td><td color="green">${checkOut}</td></tr>`;
    } else {
      const checkIn = formatTime(item["oraEntrata"]);
      const checkOut = formatTime(item["oraUscita"]);
      totalMilliseconds += calculateTimeDifference(checkIn, checkOut);
      tableHTML += `<tr><td>${item["operatore"]}</td><td>${checkIn}</td><td>${checkOut}</td></tr>`;
    }
  });

  tableHTML += "</table>";

  // Calculate total working hours
  const lastTotalHours = Math.floor(totalMilliseconds / 3600000);
  const lastTotalMinutes = Math.floor((totalMilliseconds % 3600000) / 60000);
  const lastTotalSeconds = Math.floor((totalMilliseconds % 60000) / 1000);

  // Append total working Time to the table
  tableHTML += `<p>Total Working Time: ${lastTotalHours}:${lastTotalMinutes}:${lastTotalSeconds}</p>`;

  return tableHTML;
}

document.addEventListener("DOMContentLoaded", function () {
  const trackButton = document.getElementById("trackButton");

  trackButton.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "fetchData" }, (response) => {
      if (response.success) {
        const outputDiv = document.getElementById("output");

        // Create a DOM element to parse the HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(response.data, "text/html");

        // Find the table element with the ID "myList"
        const table = doc.querySelector("#myList");

        // Initialize an array to store the results
        const results = [];

        // Loop through each row in the table (excluding the header row)
        const rows = table.querySelectorAll(".myrow");
        rows.forEach((row) => {
          const cells = row.querySelectorAll("td");
          const nr = cells[0].textContent;
          const team = cells[1].textContent;
          const operatore = cells[2].textContent;
          const dataEntrata = cells[3].textContent;
          const oraEntrata = cells[4].textContent;
          const dataUscita = cells[5].textContent;
          const oraUscita = cells[6].textContent;
          const tempoDiPresenza = cells[7].textContent;

          // If the operatore matches "Sajmir Doko", store the result
          if (operatore === "Sajmir Doko") {
            results.push({
              nr,
              team,
              operatore,
              dataEntrata,
              oraEntrata,
              dataUscita,
              oraUscita,
              tempoDiPresenza,
            });
          }
        });

        outputDiv.innerHTML = createTable(results);
      } else {
        console.error("Error fetching data:", response.error);
        const outputDiv = document.getElementById("output");
        outputDiv.textContent =
          "Error fetching data. Check console!";
      }
    });
  });
});
