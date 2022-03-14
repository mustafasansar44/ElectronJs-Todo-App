const electron = require("electron")
const { BrowserWindow, Menu, ipcMain } = require("electron");
const url = require("url")
const path = require("path");
const { devNull } = require("os");
const db = require("./lib/connection").db

require('electron-reload')(__dirname, {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
});
const { app } = electron;

let mainWindow;
let todos = []

app.on("ready", () => {

    mainWindow = new BrowserWindow({
        width: 700,
        height: 1000,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            webSecurity: false,
        },
    })

    // Pencerenin oluşturulması
    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, "./index.html"),
            protocol: "file:",
            slashes: true
        })
    )
    
    mainWindow.webContents.once("dom-ready", () => {

        db.query("SELECT * FROM todos", (error, results, fields) => {
            todos = results
            todosList()
        })


    })

    ipcMain.on("insertTodo", (err, todo) => {
        db.query(`INSERT INTO todos (todo) VALUES ('${todo}')`, function (error, results, fields) {
            todos.push({
                id: results.insertId,
                todo: todo
            })
            todosList() 
        });
       
    })
    
    ipcMain.on("deleteTodo", (err, id) => {
        db.query('DELETE FROM todos WHERE id = ?', id, function (error, results, fields) {
            if (error) throw error;
            todos = todos.filter(todo => todo.id != id)
            todosList()
        })
    })



    // Top menünün oluşturulması
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate)
    Menu.setApplicationMenu(mainMenu)
})

function todosList(){
    mainWindow.webContents.send("TodosList", todos)
}



// Menü Template
const mainMenuTemplate = [
    {
        label: "Dosya",
        submenu: [
            { label: "Yeni TODO Ekle" },
            { label: "Tümünü Sil" },
            { label: "Çıkış", role: "quit", accelerator: process.platform == "darwin" ? "Command+Q" : "Ctrl+Q" }
        ]
    }
]


if (process.platform == "darwin") {
    mainMenuTemplate.unshift({
        label: app.getName(),
        role: "TODO"
    })
}

// Developer Tools 
if (process.env.NODE_ENV !== "production") {
    mainMenuTemplate.push(
        {
            label: "DevTools",
            submenu: [
                {
                    label: "Geliştirici Penceresi",
                    click(item, focusedWindow) {
                        focusedWindow.toggleDevTools();
                    }
                },
                {
                    label: "Yenile",
                    role: "reload"
                }
            ]
        }
    )
}