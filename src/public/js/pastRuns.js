
let pastRuns = null;


function getPastRuns(){
    $.get("/get/farmRun/runs/"+saveData.key, function (data) {
        pastRuns = JSON.parse(data);
        console.log("Past runs grabbed!");
        //TODO error check if the data passed back is an error

        //FIXME REMOVE THIS
        setupPastRunsPage();
    });
}

function setupPastRunsPage(){
    // find all the types of herbs that were farmed
    let listOfHerbs = ["All"];
    for(let run of pastRuns){
        if(listOfHerbs.find(x=>x.toLowerCase()==run.herbType.toLowerCase()) == undefined){
            listOfHerbs.push(run.herbType);
        }
    }

    // Draw a button to select that herb type
    let herbButtonArea = d3.select("#run-herb-type").html(null);
    for(let herb of listOfHerbs){
        herbButtonArea.append("div")
            .style("width",`calc(${100/listOfHerbs.length}% - ${listOfHerbs.length+10}px)`)
            .attr("class","past-run-toggle-button")
            .html(herb);
    }



}