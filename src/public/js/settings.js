function setupSettingsPage(){
    
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

    //TODO check if key is valid before saving the settings, post error if key is invalid

    // access key
    saveData.key = $("#settings-access-key").val();

    // number of patches
    saveData.numberOfPatches = parseInt($("#settings-number-patches").val());

    // attas
    // toggle does this

    // select herb type
    saveData.herbType = $("#settings-herb-type").val();

    save("Settings page");
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