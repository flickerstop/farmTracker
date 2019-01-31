/////////////////////////////////////////////
//          COLOURS
const reset = "\x1b[0m";
const bright = "\x1b[1m";

// const black = bright + "\x1b[30m";
// const red = bright + "\x1b[31m";
// const green = bright + "\x1b[32m";
// const yellow = bright + "\x1b[33m";
// const blue = bright + "\x1b[34m";
// const megenta = bright + "\x1b[35m";
// const cyan = bright + "\x1b[36m";
// const white = bright + "\x1b[37m";

const bgBlack = "\x1b[40m";
const bgRed = "\x1b[41m";
const bgGreen = "\x1b[42m";
const bgYellow = "\x1b[43m";
const bgBlue = "\x1b[44m";
const bgMagenta = "\x1b[45m";
const bgCyan = "\x1b[46m";
const bgWhite = "\x1b[47m";



/////////////////////////////////////////////
//const logs = require("./files/logs");

let startTime = null;
let isTest = true;

module.exports = class {
    /**
     * @description Function that saves the start time
     */
    static start() {
        startTime = Date.now();
    }

    /**
     * @description Outputs to the console and saves to log
     * @param {string} string String to output
     */
    static log(string) {
        console.log(timestamp() + string + reset);

        this.saveLog(string);
    }

    /**
     * @description outputs a parse error to the console
     * @param {string} string String to output
     */
    static error_parse(string) {
        console.log(bgRed + timestamp() + green("PARSE ERROR: ") + string + reset);

        this.saveLog("PARSE ERROR: " + string);
    }

    /**
     * @description Outputs the given error to console
     * @param {string} reason Reason for error
     * @param {string} string String to output
     */
    static error(reason, string) {
        console.log(bgRed + timestamp() + green(reason.toUpperCase()) + ": " + string + reset);

        this.saveLog(reason.toUpperCase() + ": " + string);
    }

    /**
     * @description Used for testing output
     * @param {string} string String to output
     */
    static test(string) {
        if (isTest) {
            console.log(green(string) + reset);
        }
    }

    /**
     * @description Used for testing output
     * @param {string} string String to output
     * @param {bool} bool output to show
     */
    static testEqual(case1, case2) {
        if (isTest) {
            if (case1 == case2) {
                console.log(bgGreen + white(case1 + " ==" + case2) + reset);
            } else {
                console.log(bgRed + white(case1 + " ==" + case2) + reset);
            }
        }
    }

    /**
     * @description Used for testing output
     * @param {string} string Object to output
     */
    static object(object) {
        let string = JSON.stringify(object, null, 2);

        string = string.replace(/\[/gm, cyan("["));
        string = string.replace(/\]/gm, cyan("]"));
        string = string.replace(/\"/gm, megenta("\""));
        string = string.replace(/,/gm, red(","));

        string += reset;

        if (isTest) {
            console.log(string);
        }
    }

    /**
     * @description Outputs loading information to console
     * @param {string} string String to output
     */
    static load(string) {
        console.log(timestamp() + megenta(string) + " loaded." + reset);

        this.saveLog(string);
    }

    /**
     * @description Outputs the version number nicely to code
     * @param {object} versionNum Object that holds version number info
     */
    static versionNum(versionNum) {
        console.log(`${timestamp()}v${red(versionNum.release)}.${cyan(versionNum.major)}.${yellow(versionNum.minor)}.${green(versionNum.patch)} Build ${megenta(versionNum.build)}` + reset);
    }

    /**
     * @description Outputs saving information to console
     * @param {string} string String to output
     */
    static save(string) {
        console.log(timestamp() + cyan(string) + reset);

        this.saveLog(string);
    }

    /**
     * @description Command information to the console
     * @param {string} name Name of the person using the command
     * @param {string} command Command used
     * @param {string} args All the arguments used
     */
    static command(name, command, args) {
        console.log(timestamp() + green(name) + " used the command !" + green(command) + " with arguments " + green(args) + reset);

        this.saveLog(name + " used the command !" + command + " with arguments " + args);
    }

    /**
     * 
     * @param {string} player Name of the player
     * @param {Number} levels Amount of levels gained
     * @param {string} skill Skill the levels were gained in
     */
    static levelUp(player, levels, skill) {
        console.log(timestamp() + green(player) + " gained " + green(levels) + " levels in " + green(skill));

        this.saveLog(player + " gained " + levels + " levels in " + skill);
    }

    /**
     * 
     * @param {string} player Name of the player
     * @param {number} milestone Milestone reached
     */
    static milestone(player, milestone) {
        console.log(timestamp() + green(player) + " reached a milestone of " + green(milestone) + " total levels." + reset);

        this.saveLog(player + " reach a milestone of " + milestone + " total levels.");
    }

    /**
     * @description Clears the console
     */
    static clear() {
        console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n")
    }

    /**
     * @description Adds a blank line to the console
     */
    static blank() {
        console.log("\n");
    }

    /**
     * @description Adds a line to the console
     */
    static separator() {
        console.log(blue("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~") + reset);
    }

    /**
     * @description Gets a string of the current time. Ex: 12:45:58
     */
    static getTime() {
        let time = new Date();
        return time.toLocaleTimeString();
    }

    /**
     * @description Gets a string of the current date
     */
    static getDate() {
        let time = new Date();
        return time.toDateString();
    }


    static testMode(isTest) {
        if (isTest) {
            console.log(timestamp() + green("Bot is ") + "in Testing Mode." + reset);
        } else {
            console.log(timestamp() + red("Bot IS NOT ") + "in Testing Mode." + reset);
        }
    }

    /**
     * @description Saves the given information to the log of this session
     * @param {string} string Information to save
     */
    static saveLog(string) {
        let outputString = this.getDate() + " " + this.getTime() + " -> " + string + "\n";

        //TODO allow the ability to save the logs
        //logs.save(startTime, outputString);

    }

    /**
     * @description Tells the console module that this run is a test
     */
    static startTesting() {
        isTest = true;
    }

    /**
     * @description log used when a pet is added
     * @param {string} name Name of the member who added the picture
     * @param {URL} path Path to the image upladed
     */
    static addPet(name, path) {
        console.log(timestamp() + green(name) + " Added a picture to " + green(path) + reset);

        this.saveLog(name + " added a pet picture, path: " + path);
    }

    /**
     * @description Grabs a random image of a pet from the files
     * @param {string} player Name of the player who asked for a random pet
     * @param {string} owner Name of the player who owns the pet pic
     * @param {URL} path Path of the image
     */
    static randomPet(player, owner, path) {
        console.log(timestamp() + green(player) + " got a random pet from " + green(owner) + " with path " + green(path) + reset);

        this.saveLog(player + " asked for a random pet and got " + owner + "'s " + path);
    }

    /**
     * @description Get the time that the bot started
     * @returns {string} Time the bot started in ms
     */
    static getLogTime() {
        return startTime;
    }

}


/**
 * @description turns all the given text into red
 * @param {string} string Text to turn red
 * @returns {string} With colour codes
 */
function red(string) {
    return "\x1b[1m" + "\x1b[31m" + string + "\x1b[37m";
}

/**
 * @description turns all the given text into green
 * @param {string} string Text to turn green
 * @returns {string} With colour codes
 */
function green(string) {
    return "\x1b[1m" + "\x1b[32m" + string + "\x1b[37m";
}

/**
 * @description turns all the given text into yellow
 * @param {string} string Text to turn yellow
 * @returns {string} With colour codes
 */
function yellow(string) {
    return "\x1b[1m" + "\x1b[33m" + string + "\x1b[37m";
}

/**
 * @description turns all the given text into blue
 * @param {string} string Text to turn blue
 * @returns {string} With colour codes
 */
function blue(string) {
    return "\x1b[1m" + "\x1b[34m" + string + "\x1b[37m";
}

/**
 * @description turns all the given text into megenta
 * @param {string} string Text to turn megenta
 * @returns {string} With colour codes
 */
function megenta(string) {
    return "\x1b[1m" + "\x1b[35m" + string + "\x1b[37m";
}

/**
 * @description turns all the given text into cyan
 * @param {string} string Text to turn cyan
 * @returns {string} With colour codes
 */
function cyan(string) {
    return "\x1b[1m" + "\x1b[36m" + string + "\x1b[37m";
}

/**
 * @description turns all the given text into white
 * @param {string} string Text to turn white
 * @returns {string} With colour codes
 */
function white(string) {
    return "\x1b[1m" + "\x1b[37m" + string;
}

/**
 * @description Returns the default starting to a console line
 * @returns "TIME -> "
 */
function timestamp() {
    let time = new Date().toLocaleTimeString();
    return yellow(time) + blue(" -> ");
}