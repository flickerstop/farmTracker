function setupSettingsPage(){
    
    d3.select("#settings-error").html(null);
    d3.select("#settings-note").html(null);

    // access key
    $("#settings-access-key").val(saveData.key);

    // number of patches
    $("#settings-number-patches").val(saveData.numberOfPatches);

    // attas
    if(saveData.attas){
        d3.select("#settings-attas-off").attr("class","toggle-button-off");
        d3.select("#settings-attas-on").attr("class","toggle-button-on");
    }else{
        d3.select("#settings-attas-off").attr("class","toggle-button-on");
        d3.select("#settings-attas-on").attr("class","toggle-button-off");
    }

    // select herb type
    let herbTypes = d3.select("#settings-herb-type").html(null);
    for(let herb of herbTable){
        let temp = herbTypes.append("option").attr("value",herb.name).html(herb.name);
        if(herb.name == saveData.herbType){
            temp.attr("selected","selected");
        }
    }
}

function saveSettings(){

    let newKey = $("#settings-access-key").val();
    
    // If there's no key, or the new key is different
    if(saveData.key == null || newKey != saveData.key){
        // Try to grab the settings from the server
        getSettingsFromServer(newKey).then((res)=>{
            // if data is valid, save the settings and "reload" the page
            setupSettingsPage();
            d3.select("#settings-note").html("Settings were grabbed from the server!\nClick Again to save");
        }).catch((err)=>{
            // if key is invalid/something happened, show it
            d3.select("#settings-error").html(err);
        })
        return;
    }

    // access key
    saveData.key = newKey;

    // number of patches
    saveData.numberOfPatches = parseInt($("#settings-number-patches").val());

    // select herb type
    saveData.herbType = $("#settings-herb-type").val();

    save("Settings page");
    setSettingsOnServer().then((res)=>{
        console.log(res);
        stateSwitcher(1);
    }).catch((err) => {
        d3.select("#settings-error").html(err);
    });
}

function attasBoostToggle(status){
    if(status == 0){
        d3.select("#settings-attas-off").attr("class","toggle-button-on");
        d3.select("#settings-attas-on").attr("class","toggle-button-off");
        saveData.attas = false;
    }else{
        d3.select("#settings-attas-off").attr("class","toggle-button-off");
        d3.select("#settings-attas-on").attr("class","toggle-button-on");
        saveData.attas = true;
    }
}

function getSettingsFromServer(key){
    return new Promise(function(resolve, reject) {
        if(key == null){
            return reject("no key");
        }
        $.get("/get/settings/"+key, function (data) {
            if(data == "Invalid Key"){
                return reject("Invalid Key");
            }else{
                saveData.key = key;
                pastRunPage.pastRuns = JSON.parse(data);
                let json = JSON.parse(data);
                //console.log(json);
                saveData.attas = json.attas;
                saveData.herbType = json.herbType;
                saveData.lastRun = json.lastRun;
                saveData.numberOfPatches = json.numberOfPatches;
                saveData.onRun = json.onRun;
                saveData.remind = json.remind;
                save("Settings from server");
                resolve("updated");
            }
            
        });
    });
}

function setSettingsOnServer(){
    return new Promise(function(resolve, reject) {
        let toSend = {
            key: saveData.key,
            numberOfPatches: saveData.numberOfPatches,
            attas: saveData.attas,
            herbType: saveData.herbType,
            lastRun: saveData.lastRun,
            remind: saveData.remind,
            onRun: saveData.onRun
        }
        $.post("/post/settings", toSend,function( data ) {
            if(data == "invalid_key"){
                reject("INVALID KEY!");
            }else if(data == "updated"){
                resolve("server settings updated");
            }else{
                reject("Something went wrong :(");
            }
            
        });
    });
}