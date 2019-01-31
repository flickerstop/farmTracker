
let prices = null;
let herbTable = null;

function getFarmPrices(){
    $.get("/get/farmRun", function (data) {
        prices = JSON.parse(data);
    });
    $.getJSON("./json/herbs.json", function (json) {
        herbTable = json;
    })
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
        }else{
            setupFarmPage();
            //TODO start the countdown
        }
        
    });

    function find(id){
        return prices.find(x=> x.id == id).sell;
    }
}