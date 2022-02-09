const {app, BrowserWindow, contextBridge} = require("electron");

async function winCreate() {
    let window = new BrowserWindow({
        width: 300,
        height: 400
    })
    
    window.loadFile("main.html");
}


app.whenReady().then(() => {
    if(BrowserWindow.getAllWindows().length === 0) {
        winCreate();
    }
})

app.on('windows-all-closed', function() {
    if(process.platform != 'darwin') {
        app.quit();
    }
})
