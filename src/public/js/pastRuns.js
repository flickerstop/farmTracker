
let pastRunPage = {
    pastRuns: null,
    herbType: "All",
    boostType: 2,
    maxPatch: 0,
    lists:{
        types:[],
        max:[]
    },
    chart:null
}

function getPastRuns(){
    $.get("/get/farmRun/runs/"+saveData.key, function (data) {
        pastRunPage.pastRuns = JSON.parse(data);
        console.log("Past runs grabbed!");
        //TODO error check if the data passed back is an error

        //FIXME REMOVE THIS
        setupPastRunsPage();
    });
}

/**
 * 
 * @param {*} herbType Type of herb to filter by
 * @param {*} boost 0 = none, 1 = attas, 2 = all
 */
function setupPastRunsPage(){

    let filteredRuns = generateFilteredList();

    drawAttasButtons();

    // find all the types of herbs that were farmed
    drawHerbTypeButtons(pastRunPage.pastRuns)

    // number of patches buttons
    drawNumberOfPatchesButtons(pastRunPage.pastRuns);

    
    
    

    if(filteredRuns.length == 0){
        //TODO delete the graph and list and show that no runs of this type are done
        d3.select("#list-past-runs-body").html(null);
        //d3.select("#past-runs-graph2").html(null);
        pastRunPage.chart.destroy();
        pastRunPage.chart = null;
        d3.select("#past-run-left-info").html(null);
        d3.select("#past-run-left-stats").html(null);
        d3.select("#past-run-right-info").html(null);
        d3.select("#past-run-right-stats").html(null);

    }else{
        //drawVegaGraph(filteredRuns);
        drawChartJSGraph(filteredRuns);
        drawRunList(filteredRuns);
        drawRunStats(filteredRuns);
    }
    
    disableButtons(filteredRuns);

    /***********************************************************
    ** Functions to draw parts of the page
    ************************************************************/
    function drawRunList(runs){
        let pastRunsList = d3.select("#list-past-runs-body").html(null);
        for(let run of runs){
            let temp = pastRunsList.append("tr");
            temp.append("td").html(run.herbType);
            temp.append("td").html(run.herbs);
            temp.append("td").html((run.netProfit - run.costs).toLocaleString()).style("text-align","right");
            // check attas boost
            // if(run.attas == 1){
            //     temp.append("td").html("On");
            // }else{
            //     temp.append("td").html("Off");
            // }
            
        }
    }

    function drawVegaGraph(runs){
        $.getJSON("./json/graph.json", function (graphJson) {
            let graphData = [];

            // Add the runs to the data
            let i = 0;
            let runningTotal = 0;
            for(let run of runs){
                // herb run
                graphData.push({
                    x: i,
                    y: run.herbs,
                    c: 0
                });  

                // average
                runningTotal += run.herbs;
                graphData.push({
                    x: i,
                    y: (runningTotal/(i+1)),
                    c: 1
                });

                i++;

                
            }


            // Calculate the scale for x axes
            const fixedScale = [1,5,10,25,50,100];
            let highestPossibleScale = 0;
            let xScale = [];
            // go though the possible options for the scale and
            // find what's the highest one that would work 5 times
            for(let scale of fixedScale){
                if(runs.length/(scale*5) >= 1){
                    highestPossibleScale = scale;
                }
            }

            // Build the scale with a max of 15 ticks
            for(let i = 0;i <= 15;i++){
                if(highestPossibleScale*i <= runs.length-1){
                    xScale.push(highestPossibleScale*i);
                }
            }

            // Add the scale to the json
            graphJson.axes[0].values = xScale;

            // Add the data to the json
            graphJson.data[0].values = graphData;

            // calculate the width of the graph
            graphJson.width = d3.select("#past-runs-graph").html(null).node().getBoundingClientRect().width-36;

            // Add the graph to the div
            vegaEmbed('#past-runs-graph',graphJson,{defaultStyle: false});

            //console.log(JSON.stringify(graphJson));
            
        });
    }

    function drawChartJSGraph(runs){
        var ctx = document.getElementById("past-runs-graph2");

        let dataArray = [];
        let avgArray = [];
        let i = 0;
        let runningTotal = 0;
        let temp = [];
        for(let run of runs){
            // herb run
            dataArray.push(run.herbs);  

            // average
            runningTotal += run.herbs;
            avgArray.push(roundToTwoDecimal(runningTotal/(i+1)));
            temp.push(i);
            i++;
        }

        // Check if a chart is already draw
        if(pastRunPage.chart == null){
            pastRunPage.chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: temp,
                    datasets: [{
                        label: 'Herbs Harvested',
                        data: dataArray,
                        //backgroundColor: 'rgba(96, 64, 0,0.4)',
                        borderColor: '#ffab00',
                        borderWidth: 1,
                        pointRadius: 1
                    },{
                        label: 'Avg. Harvest',
                        data: avgArray,
                        backgroundColor: 'rgba(90, 0, 102,0.4)',
                        borderColor: '#e100ff',
                        borderWidth: 1,
                        pointRadius: 0
                    }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero:false,
                                fontColor: "#ffffff",
                                fontSize: 10
                            },
                            gridLines: {
                                display: false,
                            },
                        }],
                        xAxes: [{
                            ticks: {
                                maxTicksLimit:15,
                                fontColor: "#ffffff",
                                fontSize: 10,
                                maxRotation: 0,
                                minRotation: 0
                            },
                            gridLines: {
                                display: false
                            },
                        }]
                    },
                    elements: {
                        line: {
                            tension: 0, // disables bezier curves
                        }
                    }
                }
            });
        }else{
            pastRunPage.chart.data.labels = temp;
            pastRunPage.chart.data.datasets = [{
                label: 'Herbs Harvested',
                data: dataArray,
                //backgroundColor: 'rgba(96, 64, 0,0.4)',
                borderColor: '#ffab00',
                borderWidth: 1,
                pointRadius: 1
            },{
                label: 'Avg. Harvest',
                data: avgArray,
                backgroundColor: 'rgba(90, 0, 102,0.4)',
                borderColor: '#e100ff',
                borderWidth: 1,
                pointRadius: 0
            }];
            pastRunPage.chart.update();
        }

        
    }

    function drawNumberOfPatchesButtons(runs){
        let listOfPatchCounts = [0];

        // Go through the runs and find all the unique number of patches
        for(let run of runs){
            if(listOfPatchCounts.find(x=>x==run.maxPatch) == undefined){
                listOfPatchCounts.push(run.maxPatch);
            }
        }

        let numberOfPatchesDiv = d3.select("#number-of-patches").html(null);
        for(let count of listOfPatchCounts){
            let temp = numberOfPatchesDiv.append("div")
                .style("width",`calc(${100/listOfPatchCounts.length}% - ${listOfPatchCounts.length+10}px)`)
                .attr("class","past-run-toggle-button")
                .attr("id","past-run-max-count-"+count)
                .html(count);
    
            // Set the onclick events
            if(count == 0){
                temp.on("click",onMaxPatchButton(0)).html("All");
            }else{
                temp.on("click",onMaxPatchButton(count));
            }
    
            // Make the selected button coloured
            if(pastRunPage.maxPatch == count){
                temp.attr("class","past-run-toggle-button-selected");
            }
        }

        pastRunPage.lists.max = listOfPatchCounts;
    }

    function drawHerbTypeButtons(runs){
        let listOfHerbs = ["All"];
    
        // Go through all runs and find the herb types
        for(let run of runs){
            if(listOfHerbs.find(x=>x.toLowerCase()==run.herbType.toLowerCase()) == undefined){
                listOfHerbs.push(run.herbType);
            }
            
        }
        // Draw a button to select that herb type
        let herbButtonArea = d3.select("#run-herb-type").html(null);
        let i = 0;
        for(let herb of listOfHerbs){
            let temp = herbButtonArea.append("div")
                .style("width",`calc(${100/listOfHerbs.length}% - ${listOfHerbs.length+10}px)`)
                .attr("class","past-run-toggle-button")
                .attr("id","past-run-type-"+i)
                .on("click",onTypeButton(herb))
                .html(herb);
    
            // If this herb type is the selected one, change the class to selected
            if(herb == pastRunPage.herbType){
                temp.attr("class","past-run-toggle-button-selected");
            }
            i++;
        }

        pastRunPage.lists.types = listOfHerbs;
    }

    function disableButtons(runs){
        // Go through all runs and find the herb types
        let listOfHerbs = ["All"];
        for(let run of runs){
            if(listOfHerbs.find(x=>x.toLowerCase()==run.herbType.toLowerCase()) == undefined){
                listOfHerbs.push(run.herbType);
            }
        }
        // Disable any buttons that contain 0 results
        let i = 0;
        for(let type of pastRunPage.lists.types){
            if(listOfHerbs.find(x=>x.toLowerCase()==type.toLowerCase()) == undefined){
                d3.select("#past-run-type-"+i).attr("class","past-run-toggle-button-disabled");
            }
            i++
        }

        // Check if runs have attas or no attas
        let hasAttas = false;
        let hasNonAttas = false;
        for(let run of runs){
            if(run.attas == 1){
                hasAttas = true;
            }else{
                hasNonAttas = true;
            }
            // Break early for unneeded iterations
            if(hasAttas && hasNonAttas){
                break;
            }
        }
        // Disable any buttons that contain 0 results
        if(!hasAttas){
            d3.select("#yes-boost-runs").attr("class","past-run-toggle-button-disabled");
        }
        if(!hasNonAttas){
            d3.select("#no-boost-runs").attr("class","past-run-toggle-button-disabled");
        }

        // find all the max patch counts after filtering
        let listOfPatchCounts = [0];
        for(let run of runs){
            if(listOfPatchCounts.find(x=>x==run.maxPatch) == undefined){
                listOfPatchCounts.push(run.maxPatch);
            }
        }
        // Disable any buttons that contain 0 results
        for(let count of pastRunPage.lists.max){
            if(listOfPatchCounts.find(x=>x==count) == undefined){
                d3.select("#past-run-max-count-"+count).attr("class","past-run-toggle-button-disabled");
            }
        }
    }

    function drawAttasButtons(){
        d3.select("#all-boost-runs").attr("class","past-run-toggle-button");
        d3.select("#no-boost-runs").attr("class","past-run-toggle-button");
        d3.select("#yes-boost-runs").attr("class","past-run-toggle-button");

        if(pastRunPage.boostType == 0){
            d3.select("#no-boost-runs").attr("class","past-run-toggle-button-selected");
        }else if(pastRunPage.boostType == 1){
            d3.select("#yes-boost-runs").attr("class","past-run-toggle-button-selected");
        }else{
            d3.select("#all-boost-runs").attr("class","past-run-toggle-button-selected");
        }
    }

    function drawRunStats(runs){
        // Reset divs
        d3.select("#past-run-left-info").html(null);
        d3.select("#past-run-left-stats").html(null);
        d3.select("#past-run-right-info").html(null);
        d3.select("#past-run-right-stats").html(null);


        const leftSideInfo = [
            "Number of Runs",
            "Number of Herbs",
            "Avg. Herbs Collected",
            "Avg. Herbs per Seed",
            "Number of Seeds Used",
            "Most Herbs Collected",
            "Least Herbs Collected",
            "Number of Dead",
            "Chance of Death",
            "Successful Resurrections",
            "Failed Resurrections",
            "Resurrection Chance",
            "Number of Sick"
        ];
        const rightSideInfo = [
            "Net Profit",
            "Total Costs",
            "Profit",
            "Avg. Profit per Run",
            "Net Profit per Seed"
        ];

        // Add left side text
        for(let stat of leftSideInfo){
            d3.select("#past-run-left-info").append("div").html(stat+":");
        }
        let leftSideStatsDiv = d3.select("#past-run-left-stats");

        // Add right side text
        for(let stat of rightSideInfo){
            d3.select("#past-run-right-info").append("div").html(stat+":");
        }
        let rightSideStatsDiv = d3.select("#past-run-right-stats");

        // Loop through all runs
        let numberOfHerbs = 0;
        let numberOfSeeds = 0;
        let highestCount = 0;
        let lowestCount = 99999;
        let numberOfDead = 0;
        let numberOfPatches = 0;
        let numberOfPassRes = 0;
        let numberOfFailRes = 0;
        let numberOfCured = 0;
        
        let netProfit = 0;
        let costs = 0;

        for(let run of runs){
            numberOfHerbs += run.herbs;
            numberOfSeeds += run.maxPatch - run.resPass - run.curedPatch;
            numberOfDead += run.deadPatch;
            numberOfPatches += run.maxPatch;
            numberOfPassRes += run.resPass;
            numberOfFailRes += run.resFail;
            numberOfCured += run.curedPatch;

            netProfit += run.netProfit;
            costs += run.costs;


            // Most Herbs
            if(run.herbs > highestCount){
                highestCount = run.herbs;
            }
            // Lowest Herbs
            if(run.herbs < lowestCount){
                lowestCount = run.herbs;
            }
        }

        // Number of Runs
        leftSideStatsDiv.append("div").html(runs.length.toLocaleString());
        // Number of Herbs
        leftSideStatsDiv.append("div").html(numberOfHerbs.toLocaleString());
        // Avg. Herbs Collected
        leftSideStatsDiv.append("div").html(roundToOneDecimal(numberOfHerbs/runs.length).toLocaleString());
        // Avg. Herbs per Seed
        leftSideStatsDiv.append("div").html(roundToOneDecimal(numberOfHerbs/numberOfSeeds).toLocaleString());
        // Number of Seeds Used
        leftSideStatsDiv.append("div").html(numberOfSeeds.toLocaleString());
        // Most Herbs Collected
        leftSideStatsDiv.append("div").html(highestCount.toLocaleString());
        // Least Herbs Collected
        leftSideStatsDiv.append("div").html(lowestCount.toLocaleString());
        // Number of Dead
        leftSideStatsDiv.append("div").html(numberOfDead.toLocaleString());
        // Chance of Death
        leftSideStatsDiv.append("div").html(roundToTwoDecimal(numberOfDead/numberOfPatches*100).toLocaleString()+"%");
        // Successful Resurrections
        leftSideStatsDiv.append("div").html(numberOfPassRes.toLocaleString());
        // Failed Resurrections
        leftSideStatsDiv.append("div").html(numberOfFailRes.toLocaleString());
        // Resurrection Chance
        leftSideStatsDiv.append("div").html(roundToTwoDecimal(numberOfPassRes/(numberOfPassRes+numberOfFailRes)*100).toLocaleString()+"%");
        // Number of Sick
        leftSideStatsDiv.append("div").html(numberOfCured.toLocaleString());


        // Net Profit
        rightSideStatsDiv.append("div").html(netProfit.toLocaleString() + "<span style=\"color:#f1c40f\"> gp</span>");
        // Total Costs
        rightSideStatsDiv.append("div").html(costs.toLocaleString() + "<span style=\"color:#f1c40f\"> gp</span>");
        // Profit
        rightSideStatsDiv.append("div").html((netProfit - costs).toLocaleString() + "<span style=\"color:#f1c40f\"> gp</span>");
        // Avg. Profit per Run
        rightSideStatsDiv.append("div").html(roundToOneDecimal((netProfit - costs)/runs.length).toLocaleString() + "<span style=\"color:#f1c40f\"> gp</span>");
        // Net Profit per Seed
        rightSideStatsDiv.append("div").html(roundToOneDecimal(netProfit/numberOfSeeds).toLocaleString() + "<span style=\"color:#f1c40f\"> gp</span>");
    }

    /***********************************************************
    ** Working Functions
    ************************************************************/
    function generateFilteredList(){
        // filter the list of past runs by the given arguments
        let temp = [];
        for(let run of pastRunPage.pastRuns){
            // check if type is all OR type matches given
            if(pastRunPage.herbType == "All" || run.herbType.toLowerCase() == pastRunPage.herbType.toLowerCase()){
                // If the boost type is all OR boost matches
                if(pastRunPage.boostType == 2 || pastRunPage.boostType == run.attas){
                    // if the max patch count is all OR count matches
                    if(pastRunPage.maxPatch == 0 || pastRunPage.maxPatch == run.maxPatch){
                        temp.push(run);
                    }
                }
            }
        }
        return temp;
    }

    /***********************************************************
    ** Function Returns
    ************************************************************/
    function onTypeButton(type){
        return function(){
            setHerbType(type);
        }
    }

    function onMaxPatchButton(num){
        return function(){
            setMaxPatches(num);
        }
    }
}

function setHerbType(type){
    pastRunPage.herbType = type;
    setupPastRunsPage();
}

function setBoostType(number){
    pastRunPage.boostType = number;
    setupPastRunsPage();
}

function setHerbType(type){
    // Save the new type
    pastRunPage.herbType = type;
    // reload page
    setupPastRunsPage();
}

function setMaxPatches(num){
    pastRunPage.maxPatch = num;
    setupPastRunsPage();
}

