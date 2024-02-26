const { ipcRenderer } = require("electron");

const form = document.querySelector("form");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const note = document.querySelector(".note").value,
    pickedHours = document.querySelector(".pick-hours").value * 3600000,
    pickedMinutes = document.querySelector(".pick-minutes").value * 60000;

  let notificationDate = Date.now();
  notificationDate += pickedHours + pickedMinutes;
  notificationDate = new Date(notificationDate);

  ipcRenderer.send("add-timed-note", note, notificationDate);
});
