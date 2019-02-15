
let prices = null;
let herbTable = null;
let farmRunAlarm = null;
let farmRunAlarmStartTime = null;

function getFarmPrices(){
    $.get("/get/farmRun/prices", function (data) {
        prices = JSON.parse(data);
    });
    $.getJSON("./json/herbs.json", function (json) {
        herbTable = json;
    });
}

function setupFarmPage(){
    d3.select("#current-farm-herb").html(saveData.herbType);
    d3.select("#current-numb-patches").html(saveData.numberOfPatches);

    if(saveData.attas){
        d3.select("#attas-boost")
          .html("Attas boost currently active")
          .style("color", "rgb(39, 174, 96)");
    }else{
        d3.select("#attas-boost")
          .text("No Attas boost")
          .style("color", "rgb(192, 57, 43)");
    }
    $("#numberOfHerbs").val(null);
    $("#numberOfDeadPatches").val(0);
    $("#numberOfPassRes").val(0);
    $("#numberOfFailRes").val(0);
    $("#numberOfCured").val(0);
    d3.select("#farm-run-error").html("").style('display', "none");

}

function saveFarmData(){
    d3.select("#farm-run-error").html(null).style('display', "none");

    // Check if number of herbs has been filled out
    if($("#numberOfHerbs").val() == ""){
        d3.select("#numberOfHerbs")
            .style("background-color","#902929")
            .transition().duration(2000)
            .style("background-color","rgb(39, 39, 39)");
        return;
    }

    // Get the data from the webpage
    let numHerbs = parseInt($("#numberOfHerbs").val());
    let numDead = parseInt($("#numberOfDeadPatches").val());
    let numRes = parseInt($("#numberOfPassRes").val());
    let numFail = parseInt($("#numberOfFailRes").val());
    let numCure = parseInt($("#numberOfCured").val());

    //------------------------
    // Calculate total costs
    //------------------------
    // seed price
    let singleSeedPrice = find(herbTable.find(x=>x.name == saveData.herbType).seedID);
    let patchesFarmed = saveData.numberOfPatches - numCure - numRes;
    let seedCost = singleSeedPrice * patchesFarmed;

    // res cost
    // (nat price * 12) + (soul price * 8) + (blood price * 8) + (earth price * 25)
    let resPrice = (find(286)*12)+(find(291)*8)+(find(290)*8)+(find(282)*25);
    let resCost = resPrice * (numRes + numFail);

    // Total
    let totalCost = seedCost + resCost;

    //------------------------
    // Calculate total profit
    //------------------------
    let singleHerbPrice = find(herbTable.find(x=>x.name == saveData.herbType).herbID);
    let profit = singleHerbPrice * numHerbs;

    /**
     * key
     * attas
     * herbType
     * herbs
     * curedPatch
     * deadPatch
     * maxPatch
     * resFail
     * resPass
     * costs
     * netProfit
     * time
     */
    let toSend = {
        key: saveData.key,
        attas: saveData.attas,
        herbType: saveData.herbType,
        herbs: numHerbs,
        curedPatch: numCure,
        deadPatch: numDead,
        maxPatch: saveData.numberOfPatches,
        resFail: numFail,
        resPass: numRes,
        costs: totalCost,
        netProfit: profit,
        time: Date.now()
    }

    $.post("/post/farmRun", toSend,function( data ) {
        if(data == "invalid_key"){
            d3.select("#farm-run-error").html("INVALID KEY!").style('display', null);
        }else if(data == "saved"){
            setupFarmPage();

            saveData.onRun = true;
            saveData.lastRun = Date.now();
            save("Farm run");

            // Change the button to show saved
            d3.select("#save-button")
            .html("Saved")
            .style("background-color","#9b59b6")
            .transition().duration(2000)
            .style("background-color","#0d6330")
            .style("color","#0d6330")
            .on("end", function() { d3.select("#save-button").html("Save Run").transition().duration(500).style("color","white")});
            
            // Update the new settings on the server
            setSettingsOnServer().then((res)=>{
                console.log(res);
            }).catch((err) => {
                d3.select("#farm-run-error").html(err);
            });
    
        }else{
            d3.select("#farm-run-error").html("Something went wrong! :(").style('display', null);
            //TODO if unable to push to server, maybe store in local storage and try to push later?
        }
        
    });

    function find(id){
        return prices.find(x=> x.id == id).sell;
    }
}

function farmRunClock(){
    var rightNow = new Date().getTime();

    if(saveData.onRun == true){
        var endTime = saveData.lastRun+4800000;

        if(endTime < rightNow && farmRunAlarm == null){
            if(saveData.remind){
                if(parseInt(saveData.alarmSound) <= 1){
                    farmRunAlarm = new Audio("./audio/"+saveData.alarmSound+".wav");
                }else{
                    farmRunAlarm = new Audio("./audio/"+saveData.alarmSound+".mp3");
                }
                farmRunAlarm.loop = true;
                farmRunAlarm.volume = 0.5;
                farmRunAlarmStartTime = Date.now();
                farmRunAlarm.play().catch((e)=>{
                    //console.log(e.message);
                    // Fails if user doesn't interact with the document
                    farmRunAlarm = null;
                    farmRunAlarmStartTime = null;
                });
                
                
            }
            d3.select("#farm-run-timer").html("00:00:00");
            d3.select("#topBar-middle").html("00:00:00");
            d3.select("#windowTitle").html("Farm Tracker");
        }else if(farmRunAlarm != null){
            d3.select("#farm-run-timer").html("00:00:00");
            d3.select("#topBar-middle").html("00:00:00");
            d3.select("#windowTitle").html("Run is over!");  

            // If it's been past 30 minutes, pause alarm
            if(Date.now() >= (farmRunAlarmStartTime+30000) && saveData.alarmTimer){
                try{
                    farmRunAlarm.pause();
                }catch(err){
            
                }
            }
        }else{
            d3.select("#farm-run-timer").html(msToTime(endTime-rightNow));
            d3.select("#topBar-middle").html(msToTime(endTime-rightNow));
            d3.select("#windowTitle").html(msToTime(endTime-rightNow));
        }
        
    }else{
        d3.select("#farm-run-timer").html("00:00:00");
        d3.select("#topBar-middle").html("00:00:00");
        d3.select("#windowTitle").html("Farm Tracker");
    }


    // Convert milliseconds to readable time
    function msToTime(duration) {
        //let milliseconds = parseInt((duration%1000)/100);
        let seconds = parseInt((duration/1000)%60);
        let minutes = parseInt((duration/(1000*60))%60);
        let hours = parseInt((duration/(1000*60*60))%24);

        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;

        return hours + ":" + minutes + ":" + seconds;
    }
}

function stopFarmAlarm(){
    try{
        farmRunAlarm.pause();
        farmRunAlarm.currentTime = 0;
        farmRunAlarm = null;
    }catch(err){

    }
    saveData.onRun = false;
    save();
    setSettingsOnServer();
}