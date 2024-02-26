const { ipcRenderer } = require("electron");
const connection = require("./connection");
const { unlink } = require("node:fs");

const newImaged = document.querySelector(".todo--images .add-new-task");

newImaged.addEventListener("click", () => {
  ipcRenderer.send("new-imaged");
});

ipcRenderer.on("add-imaged-task", (e, note, imgURI) => {
  addImagedTask(note, imgURI);
});

function addImagedTask(note, imgURI) {
  connection
    .insert({
      into: "imaged",
      values: [
        {
          note: note,
          img_uri: imgURI,
        },
      ],
    })
    .then(() => showImaged());
}

function deleteImagedTask(taskId, imgURI) {
  if (imgURI) {
    unlink(imgURI, (err) => {
      if (err) {
        console.log(err);
        return;
      }
    });
  }
  return connection
    .remove({
      from: "imaged",
      where: {
        id: taskId,
      },
    })
    .then(() => showImaged());
}

function updateImagedTask(taskId, taskValue) {
  connection
    .update({
      in: "imaged",
      where: {
        id: taskId,
      },
      set: {
        note: taskValue,
      },
    })
    .then(() => showImaged());
}

function showImaged() {
  const clearImagedBtn = document.querySelector(".todo--images .clear-all");
  const imagedList = document.querySelector(".todo--images__list");
  imagedList.innerHTML = "";

  connection
    .select({
      from: "imaged",
    })
    .then((tasks) => {
      if (tasks.length === 0) {
        imagedList.innerHTML = "<li class='empty-list'>لاتوجد مهام</li>";
        clearImagedBtn.classList.remove("clear-all--show");
      } else {
        clearImagedBtn.classList.add("clear-all--show");
        clearImagedBtn.addEventListener("click", () => {
          return connection
            .remove({
              from: "imaged",
            })
            .then(() => showImaged());
        });
        for (const task of tasks) {
          clearImagedBtn.addEventListener("click", () => {
            unlink(task.img_uri, (err) => {
              if (err) {
                console.log(err);
                return;
              }
            });
          });
          const listItem = document.createElement("li"),
            taskInput = document.createElement("input"),
            imageHolder = document.createElement("div"),
            taskImage = document.createElement("img"),
            deleteBtn = document.createElement("button"),
            buttonsHolder = document.createElement("div"),
            noteContentHolder = document.createElement("div"),
            updateBtn = document.createElement("button"),
            exportBtn = document.createElement("button");

          taskInput.value = task.note;
          buttonsHolder.classList.add("buttons-holder");

          updateBtn.innerHTML = "تحديث <i class='fas fa-trash-alt'></i>";
          deleteBtn.innerHTML = "حذف <i class='fas fa-clout-upload-alt'></i>";
          exportBtn.innerHTML = "تصدير <i class='fas fa-file-export'></i>";
          taskImage.setAttribute("src", task.img_uri);

          deleteBtn.addEventListener("click", () => {
            deleteImagedTask(task.id, task.img_uri);
          });

          updateBtn.addEventListener("click", () => {
            updateImagedTask(task.id, taskInput.value);
          });

          exportBtn.addEventListener("click", () => {
            ipcRenderer.send("create-txt", task.note);
          });

          buttonsHolder.appendChild(deleteBtn);
          buttonsHolder.appendChild(updateBtn);
          buttonsHolder.appendChild(exportBtn);
          noteContentHolder.appendChild(taskInput);
          noteContentHolder.appendChild(buttonsHolder);
          imageHolder.appendChild(taskImage);
          listItem.appendChild(noteContentHolder);
          listItem.appendChild(imageHolder);
          imagedList.appendChild(listItem);
        }
      }
    });
}

showImaged();
