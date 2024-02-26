const { ipcRenderer } = require("electron");
const { copyFile } = require("node:fs");
const path = require("node:path");

const form = document.querySelector("form");

let fileName,
  filePath,
  imagePath,
  btn = document.querySelector(".img-upload"),
  urlImg = document.querySelector(".url-image__input");

btn.addEventListener("click", (e) => {
  e.preventDefault();
  if (urlImg.value.length === 0) {
    ipcRenderer.send("upload-image");
  }
});

ipcRenderer.on("open-file", (e, arg, appPath) => {
  if (urlImg.value.length === 0) {
    (imagePath = arg[0]), (fileName = path.basename(imagePath));
    filePath =
      process.platform === "win32"
        ? appPath + "\\" + fileName
        : appPath + fileName;
  }
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.querySelector(".note").value;
  const urlImgPath = urlImg.value;
  if (urlImg.value.length === 0) {
    copyFile(imagePath, filePath, (err) => {
      if (err) throw err;
    });
    ipcRenderer.send("add-imaged-task", input, filePath);
  } else if (urlImg.value.length !== 0) {
    ipcRenderer.send("add-imaged-task", input, urlImgPath);
  }
});
