// Function to format time as HH:MM:SS
function formatTime(time) {
  const [hours, minutes, seconds] = time.split(":");
  const formattedHours = hours.padStart(2, "0");
  const formattedMinutes = minutes.padStart(2, "0");
  const formattedSeconds = seconds.padStart(2, "0");
  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

// Function to calculate the difference between two times
function calculateTimeDifference(start, end) {
  const startTime = new Date(`2000-01-01T${start}`);
  const endTime = new Date(`2000-01-01T${end}`);
  const timeDiff = endTime - startTime;
  return timeDiff;
}

const port = chrome.runtime.connect({name: "checkInTracker"});

// Periodically check for data and notifications
setInterval(() => {
  port.postMessage({action: "citFetchData"});
  port.onMessage.addListener(function(response) {
    if (response.success) {
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

      let totalMilliseconds = 0;

      results.forEach((item) => {
        // Add the last row if Operatore is still checked in
        if (item["oraUscita"] === "00:00:00") {
          const lastCheckIn = formatTime(item["oraEntrata"]);
          const now = new Date();
          const currentTime = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
          totalMilliseconds += calculateTimeDifference(
            lastCheckIn,
            formatTime(currentTime)
          );
        } else {
          const checkIn = formatTime(item["oraEntrata"]);
          const checkOut = formatTime(item["oraUscita"]);
          totalMilliseconds += calculateTimeDifference(checkIn, checkOut);
        }
      });

      // Calculate total working hours
      const lastTotalHours = Math.floor(totalMilliseconds / 3600000);
      const lastTotalMinutes = Math.floor((totalMilliseconds % 3600000) / 60000);

      if (lastTotalHours >= 7) {
        port.postMessage({
          action: "citPushNotif",
          time: `${lastTotalHours}:${lastTotalMinutes}`,
        });
      }
    } else {
      console.error("Error fetching data:", response.error);
    }
  });

}, 5 * 60000); // 5 minutes interval in milliseconds
