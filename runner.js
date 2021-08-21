const TestLib = require('./TestLib');
const { applyFlags, setCustomLogs, getTestResults } = require('./utils');

function logResults(results) {
    const testlib = new TestLib();
    testlib.logTestResults(results);
}

(async function() {
    /*** Function call order matters here ***/
    setCustomLogs();
    const args = process.argv.slice(2);
    applyFlags(args);
    const results = await getTestResults(args);
    logResults(results);
})();