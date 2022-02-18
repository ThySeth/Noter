const {app, BrowserWindow, ipcMain, ipcRenderer} = require("electron");
const Wasteful = require("wastefuldb");
const db = new Wasteful({serial: true, feedback: true, path: `${__dirname}/storage/`});

async function winCreate() {
    let window = new BrowserWindow({
        width: 300,
        height: 400,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        autoHideMenuBar: true
    })
    
    window.loadFile("main.html");
    window.webContents.on('did-finish-load', () => {
      let data;
        for(let i = 0; i < db.size(); i++) {
            data = db.find({id: `${i.toString()}`}); 
             data = data.length == 0 ? "<Unable to find note>" : data;
              window.webContents.send("note:startup", data.note);
        }
    })
}

ipcMain.on("note:new", function(e, text) {
    if(text.length == 0) return;
     db.insert({note: text});
})

app.whenReady().then(async() => {
    if(BrowserWindow.getAllWindows().length === 0) {
        winCreate();
    }
})

app.on('windows-all-closed', function() {
    if(process.platform != 'darwin') {
        app.quit();
    }
})
