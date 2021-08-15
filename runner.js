const TestSuite = require('./TestSuite');
const { applyFlags, setCustomLogs, getTestResults } = require('./utils');

function init() {
    /*** Function call order matters here ***/
    setCustomLogs();
    const args = process.argv.slice(2);
    applyFlags(args);
    const results = getTestResults(args);
    logResults(results);
}

function logResults(results) {
    const testSuite = new TestSuite();
    testSuite.logTestResults(results);
}

init();