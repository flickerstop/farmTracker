
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

    // draw the past runs in a list
    let pastRunsList = d3.select("#list-past-runs-body").html(null);
    for(let run of pastRuns){
        let temp = pastRunsList.append("tr");
        temp.append("td").html(run.herbType);
        temp.append("td").html(run.herbs);
        temp.append("td").html(run.netProfit - run.costs);
        if(run.attas == 1){
            temp.append("td").html("On");
        }else{
            temp.append("td").html("Off");
        }
        
    }


}