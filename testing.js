var esprimaScript = document.createElement('script');
esprimaScript.src = "https://unpkg.com/esprima@~4.0/dist/esprima.js";
esprimaScript.type = 'text/javascript';
esprimaScript.defer = true;

document.getElementsByTagName('head').item(0).appendChild(esprimaScript);

const COLOR_CODE = {
    reset: "\x1b[0m",
    cyan: "\x1b[36m",
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    white: "\x1b[37m",
    bgBlack: "\x1b[40m",
    bgRed: "\x1b[41m",
    bgGreen: "\x1b[42m",
    bgYellow: "\x1b[43m",
    bgBlue: "\x1b[44m",
    bgMagenta: "\x1b[45m",
    bgCyan: "\x1b[46m",
    bgWhite: "\x1b[47m",
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    underscore: "\x1b[4m",
    blink: "\x1b[5m",
    reverse: "\x1b[7m",
    hidden: "\x1b[8m",
};

// Resources to display in hint messages.
const RESOURCES = {
    callingFunctions: {
        course: "JavaScript Functions: How to Function",
        web: "https://www.w3schools.com/js/js_function_invocation.asp"
    },
    createElement: {
        course: "DOM Manipulation: Creating and Removing Elements",
        web: "https://www.javascripttutorial.net/javascript-dom/javascript-createelement/"
    },
    classListAdd: {
        course: "DOM Manipulation: Adding and Removing Classes",
        web: "https://www.javascripttutorial.net/javascript-dom/javascript-classlist/"
    },
    innerHTML: {
        course: "DOM Manipulation: Modifying HTML with innerHTML",
        web: "https://www.javascripttutorial.net/javascript-dom/javascript-innerhtml/"
    },
    appendChild: {
        course: "DOM Manipulation: Creating and Removing Elements",
        web: "https://www.javascripttutorial.net/javascript-dom/javascript-appendchild/"
    },
    arrays: {
        course: "Arrays and Conditionals: Array Basics",
        web: "https://www.w3schools.com/js/js_arrays.asp"
    },
    underscore: {
        web: "https://www.tutorialspoint.com/underscorejs/underscorejs_shuffle.htm"
    },
    forLoops: {
        course: "Loops: For Loops",
        web: "https://www.w3schools.com/js/js_loop_for.asp"
    },
    objects: {
        course: "Objects: Objects",
        web: "https://www.javascripttutorial.net/javascript-objects/"
    },
    equality: {
        web: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Equality"
    },
    _undefined: {
        web: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined"
    },
    increment: {
        course: "JavaScript Basics: The Increment and Decrement Operator",
        web: "https://www.javascripttutorial.net/javascript-unary-operators/"
    },
    conditionals: {
        course: "Arrays and Conditionals: Making Decisions with Conditionals",
        web: "https://javascript.info/ifelse"
    },
    push: {
        web: "https://www.w3schools.com/jsref/jsref_push.asp",
    },
    returnInfo: {
        course: "JavaScript Functions: How to Function",
        web: "https://www.w3schools.com/JSREF/jsref_return.asp",
    },
};


//   console log a syntax tree starting from codeSyntax
function find(codeSyntax) {
    console.log(esprima.parseScript(JSON.stringify(codeSyntax)))
}

function banner() {
    console.log(`${COLOR_CODE.underscore}${COLOR_CODE.bright}**************Instructor FeedBack**************${COLOR_CODE.reset}\n`)
}


// Serializes an HTML element to a string.
function serialize(element) {
    var serializer = new XMLSerializer();
    var result = serializer.serializeToString(element);
    return result.replace(' xmlns="http://www.w3.org/1999/xhtml"', '');
}

let origLog = console.log;
let pendingOutput = "";
function fakeConsole() {
    pendingOutput = "";
    let fakeLog = (text) => {
        pendingOutput += text;
        return fakeLog;
    };
}

function restoreConsole() {
    console.log = origLog;
    if (pendingOutput.length > 0) {
        console.log(pendingOutput);
    }
}

// Safely call student/user code and catch any exceptions.
function callUserCode(code) {
    fakeConsole();

    try {
        code();
    } catch (err) {
        restoreConsole();
        return err;
    }

    restoreConsole();
    return undefined;
}

// Construct typical resource guide for students.
function constructResourceGuide(moduleContent, webContent) {
    let moduleText = "";
    if (moduleContent) {
        moduleText = `\n${COLOR_CODE.cyan}${COLOR_CODE.underscore}HQ Resource:${COLOR_CODE.reset} ${moduleContent}`;
    }

    let webText = "";
    if (webContent) {
        webText = `\n${COLOR_CODE.cyan}${COLOR_CODE.underscore}Web Resource:${COLOR_CODE.reset} ${webContent}`;
    }

    return `${moduleText}${webText}`;
}

// Construct a typical error message for a step.
function constructErrorMessage(testName, step, message) {
    stepString = ` at STEP-${step}`;
    return `${COLOR_CODE.red}FAILED::${testName}${stepString}${COLOR_CODE.reset}\n${message}`
}

// Construct a hint message for a step.
function constructHintMessage(step, message, resource) {
    resourceText = "";
    if (resource) {
        resourceText = constructResourceGuide(resource["course"], resource["web"]);
    }

    return `${COLOR_CODE.cyan}HINT (STEP-${step})\n${message}${resourceText}${COLOR_CODE.reset}`;
}

// Construct an error message for when we believe the step being checked is not where the student made a mistake.
function constructLateErrorMessage(testName, step) {
    return constructErrorMessage(testName, step, `This test failed our check of Step ${step} but we think the problem may be at an earlier step.`);
}

function outputPassMessage(testName) {
    console.log(`${COLOR_CODE.green}PASSED ${testName}${COLOR_CODE.reset}`);
}

// Check if a function includes some text.
function functionHasText(functionName, text) {
    let str = String(functionName)
    if (str.includes(`${testingFor}`)) {
        return true
    }
}

// Create a 'spec' object for a function to test heuristics about the textual content of that function.
function functionSpec(functionRef) {
    return {
        functionRef: functionRef,
        containsLists: [],
        lastList: function () {
            return this.containsLists[this.containsLists.length - 1];
        },
        contains: function (string) {
            this.containsLists.push([string]);
            let returnObj = Object.assign({}, this);
            delete returnObj.contains;
            return returnObj;
        },
        or: function (string) {
            this.lastList().push(string);
            return this;
        },
        andThen: function (string) {
            this.containsLists.push([string]);
            return this;
        }
    };
}

// Returns true if the spec object passes requirements, false otherwise.
function checkFunctionSpec(spec) {
    // Get function test and delete comments.
    let text = String(spec.functionRef)
        .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, "$1");

    let searchPosition = 0;

    // Loop through each sub-list.
    for (let i = 0; i < spec.containsLists.length; i++) {

        // Check if sub-list contains any of the listed strings.
        let matchFound = false;
        let earliestMatchIndex = 9999999;

        for (let j = 0; j < spec.containsLists[i].length; j++) {
            let matchIndex = text.indexOf(spec.containsLists[i][j], searchPosition);

            if (matchIndex > -1) {
                matchFound = true;
                earliestMatchIndex = Math.min(matchIndex + spec.containsLists[i][j].length, earliestMatchIndex);
            }
        }

        // Return failure if no sub-list strings were found.
        if (matchFound == false) {
            return false;
        }
        searchPosition = earliestMatchIndex;
    }

    return true;
}