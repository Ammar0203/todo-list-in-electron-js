const { ipcRenderer } = require("electron");
const connection = require("./connection");

const newTimed = document.querySelector(".todo--timed .add-new-task");

newTimed.addEventListener("click", () => {
  ipcRenderer.send("new-timed");
});

ipcRenderer.on("add-timed-note", (e, note, notificationTime) => {
  addTimedTask(note, notificationTime);
});

function addTimedTask(note, notificationTime) {
  connection
    .insert({
      into: "timed",
      values: [
        {
          note: note,
          pick_status: 0,
          pick_time: notificationTime,
        },
      ],
    })
    .then(() => showTimed());
}

function deleteTimedTask(taskId) {
  return connection
    .remove({
      from: "timed",
      where: {
        id: taskId,
      },
    })
    .then(() => showTimed());
}

function updateTimedTask(taskId, taskValue) {
  connection.update({
    in: "timed",
    where: {
      id: taskId,
    },
    set: {
      note: taskValue,
    },
  });
}

function showTimed() {
  const clearTimedBtn = document.querySelector(".todo--timed .clear-all");
  const timedList = document.querySelector(".todo--timed__list");
  timedList.innerHTML = "";

  connection
    .select({
      from: "timed",
    })
    .then((tasks) => {
      if (tasks.length === 0) {
        timedList.innerHTML = "<li class='empty-list'>لاتوجد مهام</li>";
        clearTimedBtn.classList.remove("clear-all--show");
      } else {
        clearTimedBtn.classList.add("clear-all--show");
        clearTimedBtn.addEventListener("click", () => {
          return connection
            .remove({
              from: "timed",
            })
            .then(() => showTimed());
        });
        for (const task of tasks) {
          const listItem = document.createElement("li"),
            taskInput = document.createElement("input"),
            timeHolder = document.createElement("div"),
            deleteBtn = document.createElement("button"),
            buttonsHolder = document.createElement("div"),
            updateBtn = document.createElement("button"),
            exportBtn = document.createElement("button");

          timeHolder.classList.add("time-holder");
          buttonsHolder.classList.add("buttons-holder");

          updateBtn.innerHTML = "تحديث <i class='fas fa-trash-alt'></i>";
          deleteBtn.innerHTML = "حذف <i class='fas fa-clout-upload-alt'></i>";
          exportBtn.innerHTML = "تصدير <i class='fas fa-file-export'></i>";

          taskInput.value = task.note;

          deleteBtn.addEventListener("click", () => {
            deleteTimedTask(task.id);
          });

          updateBtn.addEventListener("click", () => {
            updateTimedTask(task.id, taskInput.value);
          });

          exportBtn.addEventListener("click", () => {
            ipcRenderer.send("create-txt", task.note);
          });

          if (task.pick_status === 1) {
            timeHolder.innerHTML =
              "جرى التنبية في الساعة" + task.pick_time.toLocaleTimeString();
          } else {
            timeHolder.innerHTML =
              "يتم التنبيه في الساعة" + task.pick_time.toLocaleTimeString();
          }

          const checkInterval = setInterval(() => {
            const currentDate = new Date();

            if (task.pick_time.toString() === currentDate.toString()) {
              connection
                .update({
                  in: "timed",
                  where: {
                    id: task.id,
                  },
                  set: {
                    pick_status: 1,
                  },
                })
                .then(() => showTimed());

              ipcRenderer.send("notify", task.note);
              clearInterval(checkInterval);
            }
          }, 1000);

          buttonsHolder.appendChild(deleteBtn);
          buttonsHolder.appendChild(updateBtn);
          buttonsHolder.appendChild(exportBtn);
          listItem.appendChild(taskInput);
          listItem.appendChild(timeHolder);
          listItem.appendChild(buttonsHolder);
          timedList.appendChild(listItem);
        }
      }
    });
}

showTimed();
