
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
            temp.append("td").html(new Date(parseInt(run.time)).toDateString());
            // check attas boost
            // if(run.attas == 1){
            //     temp.append("td").html("On");
            // }else{
            //     temp.append("td").html("Off");
            // }
            
        }
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


        const gpString = "<span style=\"color:#f1c40f\"> gp</span>";

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
            "Income",
            "Total Costs",
            "Profit",
            "Avg. Profit per Run",
            "Net Profit per Seed",
            "Days Tracked",
            "Avg. Runs per Day",
            "Profit per Day"
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
        
        // Find total number of days tracked
        let startTime = runs[0].time;
        let endTime = runs[runs.length-1].time;
        let daysRun = (endTime - startTime)/86400000;

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
        statsAddLeft(runs.length.toLocaleString());
        // Number of Herbs
        statsAddLeft(numberOfHerbs.toLocaleString());
        // Avg. Herbs Collected
        statsAddLeft(roundToOneDecimal(numberOfHerbs/runs.length).toLocaleString());
        // Avg. Herbs per Seed
        let avgPerSeed = roundToOneDecimal(numberOfHerbs/numberOfSeeds);
        console.log(avgPerSeed);
        statsAddLeft(avgPerSeed.toLocaleString());
        // Number of Seeds Used
        statsAddLeft(numberOfSeeds.toLocaleString());
        // Most Herbs Collected
        statsAddLeft(highestCount.toLocaleString());
        // Least Herbs Collected
        statsAddLeft(lowestCount.toLocaleString());
        // Number of Dead
        statsAddLeft(numberOfDead.toLocaleString());
        // Chance of Death
        statsAddLeft(roundToTwoDecimal(numberOfDead/numberOfPatches*100).toLocaleString()+"%");
        // Successful Resurrections
        statsAddLeft(numberOfPassRes.toLocaleString());
        // Failed Resurrections
        statsAddLeft(numberOfFailRes.toLocaleString());
        // Resurrection Chance
        statsAddLeft(roundToTwoDecimal(numberOfPassRes/(numberOfPassRes+numberOfFailRes)*100).toLocaleString()+"%");
        // Number of Sick
        statsAddLeft(numberOfCured.toLocaleString());


        // Net Profit
        statsAddRight(netProfit.toLocaleString() + gpString);
        // Total Costs
        statsAddRight(costs.toLocaleString() + gpString);
        // Profit
        statsAddRight((netProfit - costs).toLocaleString() + gpString);
        // Avg. Profit per Run
        statsAddRight(roundToOneDecimal((netProfit - costs)/runs.length).toLocaleString() + gpString);
        // Net Profit per Seed
        statsAddRight(roundToOneDecimal(netProfit/numberOfSeeds).toLocaleString() + gpString);
        
        // Number of days tracked
        statsAddRight(Math.round(daysRun));
        // Avg. Runs per day
        statsAddRight(roundToTwoDecimal(runs.length/daysRun).toLocaleString());
        // Profit per day
        statsAddRight(roundToTwoDecimal((runs.length/daysRun)*((netProfit - costs)/runs.length)).toLocaleString() + gpString);
    

        /////////////
        // Herb avgs
        d3.select("#pr-herb-type-title").html(`Running Herbs at ${avgPerSeed.toLocaleString()} Avg.`);
        d3.select("#pr-herb-type-left").html("");
        d3.select("#pr-herb-type-right").html("");
        let highest = 0;
        let highestID = "";
        for(let herbType of herbTable){
            let herbPrice = findPrice(herbType.herbID);
            let seedPrice = findPrice(herbType.seedID);
            let profit = roundToTwoDecimal((herbPrice*avgPerSeed)-seedPrice);
            let id = "pc-herb-"+herbType.name.replace(/\s+/g, '-').toLowerCase();
            addHerbStat(herbType.name,profit.toLocaleString(),id);

            if(profit > highest){
                highest = profit;
                highestID = id;
            }
        }

        d3.select("#"+highestID).style("color","#9b59b6");


        // Functions to draw
        function findPrice(id){
            return prices.find(x=>x.id==id).sell;
        }

        function addHerbStat(name,data,id){
            d3.select("#pr-herb-type-left").append("div").html(name+":");
            d3.select("#pr-herb-type-right").append("div").html(data + gpString).attr("id",id);
        }

        function statsAddRight(html){
            rightSideStatsDiv.append("div").html(html);
        }

        function statsAddLeft(html){
            leftSideStatsDiv.append("div").html(html);
        }
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

