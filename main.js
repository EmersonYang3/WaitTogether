document.addEventListener("DOMContentLoaded", () => {
  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");
  const visitorsEl = document.querySelector(".stats-container p");

  const countdown = () => {
    const newYear = new Date("January 1, 2025 00:00:00").getTime();
    const now = new Date().getTime();
    const distance = newYear - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = days;
    hoursEl.textContent = hours;
    minutesEl.textContent = minutes;
    secondsEl.textContent = seconds;

    if (distance < 0) {
      clearInterval(interval);
      document.getElementById("headline").textContent = "Happy New Year!";
    }
  };

  const updateVisitors = async () => {
    try {
      const response = await fetch("/.netlify/functions/visitor");

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      visitorsEl.textContent = `People Waiting With You: ${data}`;
    } catch (error) {
      console.error("Error fetching visitor count:", error);

      const responseText = await response.text();
      console.log("Response Text:", responseText);
    }
  };

  setInterval(updateVisitors, 60000);

  countdown();
  updateVisitors();

  const interval = setInterval(countdown, 1000);

  window.addEventListener("load", async () => {
    try {
      await fetch("/.netlify/functions/visitors", { method: "POST" });
      updateVisitors();
    } catch (error) {
      console.error("Error adding user to waitlist:", error);
    }
  });

  window.addEventListener("beforeunload", async () => {
    try {
      await fetch("/.netlify/functions/visitors", { method: "DELETE" });
    } catch (error) {
      console.error("Error removing user from waitlist:", error);
    }
  });
});
