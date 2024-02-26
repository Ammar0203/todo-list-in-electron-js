const {
  app,
  BrowserWindow,
  Menu,
  ipcMain,
  dialog,
  Notification,
  Tray
} = require("electron");
const fs = require("node:fs");
const path = require("node:path");
const appPath = app.getPath('userData')

let mainWindow, addWindow, addTimedWindow, addImagedWindow, tray = null;

process.env.NODE_ENV = 'production'

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  mainWindow.loadFile("index.html");

  mainWindow.on("closed", (e) => {
    app.quit();
  });

  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  Menu.setApplicationMenu(mainMenu);

  mainWindow.on('minimize', (e) => {
    e.preventDefault()
    mainWindow.hide()
    tray = createTray()
  })
  mainWindow.on('restore', (e) => {
    mainWindow.show()
    tray.destroy()
  })
});

function createTray() {
  const iconPath = path.join(__dirname, './assets/images/icon.png'),
    appIcon = new Tray(iconPath),
    contextMenu = Menu.buildFromTemplate(iconMenuTemplate)
  
  appIcon.on('click', (e) => {
    mainWindow.show()
  })

  appIcon.setToolTip('تطبيق ادارة المهام')
  appIcon.setContextMenu(contextMenu)
  return appIcon
}

const iconMenuTemplate = [
  {
    label: 'فتح',
    click() {
      mainWindow.show()
    }
  },
  {
    label: 'اغلاق',
    click() {
      app.quit()
    }
  }
]

const mainMenuTemplate = [
  {
    label: "القائمة",
    submenu: [
      {
        label: "اضافة مهمة",
        click() {
          initAddWindow();
        },
      },
      {
        label: "اضافة مهمة مؤقتة",
        click() {
          createTimedWindow();
        },
      },
      {
        label: 'اضافة مهمة مع صورة',
        click(){
          createImagedWindow()
        }
      },
      {
        label: "خروج",
        accelerator: process.platform === "darwin" ? "Cmd+Q" : "Ctrl+Q",
        click() {
          app.quit();
        },
      },
    ],
  },
];

if(process.platform === 'darwin') {
  mainMenuTemplate.unshift({})
}

if(process.env.NODE_ENV !== 'production') {
  mainMenuTemplate.push({
    label: "ادوات المطور",
    submenu: [
      {
        label: "فتح او اغلاق ادوات المطور",
        accelerator: process.platform === "darwin" ? "Cmd+D" : "Ctrl+D",
        click() {
          mainWindow.toggleDevTools();
        },
      },
      {
        label: "اهادة تحميل التطبيق",
        role: "reload",
      },
    ],
  })
}

function initAddWindow() {
  addWindow = new BrowserWindow({
    width: 400,
    height: 250,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  addWindow.loadFile("./views/normalTask.html");

  addWindow.on("closed", (e) => {
    e.preventDefault();
    addWindow = null;
  });

  addWindow.removeMenu();
}

ipcMain.on("add-normal-task", (e, item) => {
  mainWindow.webContents.send("add-normal-task", item);
  addWindow.close();
});

ipcMain.on("new-normal", (e) => {
  initAddWindow();
});

ipcMain.on("create-txt", (e, note) => {
  const dest = Date.now() + "-task.txt";
  dialog
    .showSaveDialog({
      title: "اختار مكان حفظ الملف",
      defaultPath: path.join(__dirname, "./" + dest),
      buttonLabel: "save",
      filters: [
        {
          name: "Text Files",
          extensions: ["txt"],
        },
      ],
    })
    .then((file) => {
      if (!file.canceled) {
        fs.writeFile(file.filePath.toString(), note, (err) => {
          if (err) throw err;
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

function createTimedWindow() {
  addTimedWindow = new BrowserWindow({
    width: 400,
    height: 400,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  addTimedWindow.loadFile(path.join(__dirname, "./views/timedTask.html"));

  addTimedWindow.on("closed", (e) => {
    e.preventDefault();
    addTimedWindow = null;
  });

  addTimedWindow.removeMenu();
}

ipcMain.on("add-timed-note", (e, note, notificationTime) => {
  mainWindow.webContents.send("add-timed-note", note, notificationTime);
  addTimedWindow.close();
});

ipcMain.on("notify", (e, taskValue) => {
  new Notification({
    title: "لديك تنبيه من مهامك",
    body: taskValue,
    icon: path.join(__dirname, "./assets/images/icon.png"),
  }).show();
});

ipcMain.on("new-timed", (e) => {
  createTimedWindow();
});

function createImagedWindow() {
  addImagedWindow = new BrowserWindow({
    width: 400,
    height: 420,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  addImagedWindow.loadFile(path.join(__dirname, "./views/imagedTask.html"));

  addImagedWindow.on("closed", (e) => {
    e.preventDefault();
    addImagedWindow = null;
  });

  addImagedWindow.removeMenu();
}

ipcMain.on('upload-image', (e) => {
  dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      {name: 'images', extensions: ['jpg', 'png', 'gif']}
    ]
  }).then(result => {
    e.sender.send('open-file', result.filePaths, appPath)
  })
})

ipcMain.on('add-imaged-task', (e, note, imgURI) => {
  mainWindow.webContents.send('add-imaged-task', note, imgURI)
  addImagedWindow.close()
})

ipcMain.on('new-imaged', () => {
  createImagedWindow()
})