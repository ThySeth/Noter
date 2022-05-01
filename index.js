const {app, BrowserWindow, ipcMain, ipcRenderer, Notification} = require("electron");
const Wasteful = require("wastefuldb");
const db = new Wasteful({serial: true, feedback: false, path: `${__dirname}/storage/`});

async function winCreate() {
    let window = new BrowserWindow({
        width: 300,
        height: 400,
        webPreferences: {
            nodeIntegration: true, // Imperative to run. Always keep TRUE
            contextIsolation: false // REQUIRED FOR NODEJS INTEGRATION
        },
        autoHideMenuBar: true // Press 'alt' to reveal
    })
    
    window.loadFile("main.html");
    window.webContents.on('did-finish-load', () => {
      let data;
        for(let i = 0; i < db.size(); i++) { // Startup process -- sends notes to renderer to append as <div>
            data = db.find({id: `${i.toString()}`}); 
             data = data.length == 0 ? "<Unable to find note>" : data;
              window.webContents.send("note:startup", data.note);
        }

        ipcMain.on("note:get-note", function(e, request) {
            console.log("get-note req: " + request);
                db.get({note: request}, async(res) => {
                console.log(res);
                 let final;
                 let id = await res.id;
                 console.log(id);
                 db.delete({id: id.toString()});
                  res.length == 0 ? final = 400 : final = await res.id;
                    window.webContents.send("note:get-note", final);
                })
        })

        ipcMain.on("note:get-id", function(e, request) { // DB Requests ONLY
                    try{
                     let size = parseInt(db.size()); size -= 1
                        window.webContents.send("note:get-id", size); // Send to renderer for <div> ID
                    }catch(err) {
                        throw err;
                    }
        })

    })
}

ipcMain.on("note:new", function(e, text) { // Receiving from renderer -- insert new inputs
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
