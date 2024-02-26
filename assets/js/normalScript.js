const { ipcRenderer } = require("electron");

const form = document.querySelector("form");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.querySelector("#task").value;
  ipcRenderer.send("add-normal-task", input);
});
