const JsStore = require("jsstore");

let dbName = "electron_todo_db";

function getDbSchema() {
  const tblTasks = {
    name: "tasks",
    columns: {
      id: { primaryKey: true, autoIncrement: true },
      note: { notNull: true, dataType: "string" },
    },
  };

  const tblTimed = {
    name: "timed",
    columns: {
      id: { primaryKey: true, autoIncrement: true },
      note: { notNull: true, dataType: "string" },
      pick_status: { notNull: true, dataType: "number" },
      pick_time: { notNull: true, dataType: "date_time" },
    },
  };

  const tblImaged = {
    name: "imaged",
    columns: {
      id: { primaryKey: true, autoIncrement: true },
      note: { notNull: true, dataType: "string" },
      img_uri: { notNull: true, dataType: "string" },
    },
  };

  const db = {
    name: dbName,
    tables: [tblTasks, tblTimed, tblImaged],
  };
  return db;
}

const connection = new JsStore.Connection(
  new Worker("node_modules/jsstore/dist/jsstore.worker.js")
);

async function initJsStore() {
  const database = getDbSchema();
  const isDbCreated = await connection.initDb(database);
  if (isDbCreated) {
    console.log("db created");
  } else {
    console.log("db opend");
  }
}

initJsStore();

module.exports = connection;
