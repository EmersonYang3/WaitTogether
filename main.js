document.addEventListener("DOMContentLoaded", () => {
  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");
  const visitorsEl = document.querySelector(".stats-container p");

  const userId = localStorage.getItem("userId") || uuidv4();
  localStorage.setItem("userId", userId);

  const duration = 15 * 1000;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  function triggerFireworks() {
    const animationEnd = Date.now() + duration;
    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        })
      );
      confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        })
      );
    }, 250);
  }

  const countdown = (endTime) => {
    const now = new Date().getTime();
    const distance = endTime - now;

    if (distance >= 0) {
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
    } else {
      clearInterval(interval);
      document.getElementById("headline").textContent = "Happy New Year!";
      triggerFireworks();
    }
  };

  const updateVisitors = async () => {
    try {
      const response = await fetch("/.netlify/functions/visitor");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      visitorsEl.textContent = `Active Participants: ${data.LiveUsers}`;
    } catch (error) {
      console.error("Error fetching visitor count:", error);
    }
  };

  const sendHeartbeat = async () => {
    try {
      await fetch("/.netlify/functions/heartbeat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });
    } catch (error) {
      console.error("Error sending heartbeat:", error);
    }
  };

  const now = new Date();
  const currentYear = now.getFullYear();
  const newYearDate = new Date(
    `January 1, ${currentYear + 1} 00:00:00`
  ).getTime();

  countdown(newYearDate);
  updateVisitors();

  const interval = setInterval(() => {
    countdown(newYearDate);
    updateVisitors();
  }, 10000);

  setInterval(sendHeartbeat, 30000);

  window.addEventListener("load", async () => {
    try {
      await fetch("/.netlify/functions/visitor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });
      updateVisitors();
    } catch (error) {
      console.error("Error adding user to waitlist:", error);
    }
  });

  window.addEventListener("beforeunload", async () => {
    try {
      await fetch("/.netlify/functions/visitor", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });
      updateVisitors();
    } catch (error) {
      console.error("Error removing user from waitlist:", error);
    }
  });
});
