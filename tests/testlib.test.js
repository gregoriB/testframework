const TestLib = require('../TestLib');
const { PASSED, FAILED, ASSERTIONS, TESTS } = require('../constants');
const { assertEquals } = require('./utils.js');

const tallies = {
    [TESTS]: {
        [PASSED]: 0,
        [FAILED]: 0
    },
    [ASSERTIONS]: {
        [PASSED]: 0,
        [FAILED]: 0
    }
}

// TestLib methods
const description = 'THIS IS A TEST';
const INITIALIZE_TEST_DATA = 'initializeTestData';
const CALLBACK_ARG = 'callbackArg';
const EXECUTE_BEFORE_CALLBACKS = 'executeBeforeCallbacks';
const CONSOLE_LOG_TEST = 'console.logTest';
const INCREMENT_TESTS_TALLY = 'incrementTestsTally';
const ALERT_TEST_FAILURE = 'alertTestFailure';
const GET_FIXTURE_ARGS_FROM_PARAMS = 'getFixtureArgsFromParams';

function newTestlibInstanceInitialized() {
    console.log('initializes a new instance of TestLib');
    const testlib = new TestLib();
    assertEquals(typeof testlib, 'object');
    assertEquals(testlib.tallies, undefined);
}

function initializeTestDataMethod() {
    console.log('initializeTestData method sets correct properties')
    const testlib = new TestLib();
    testlib.initializeTestData();
    assertEquals(testlib.tallies, tallies);
    assertEquals(testlib.beforeEachCallbacks.length, 0);
    assertEquals(testlib.complete, false);
}

async function getResultsMethod() {
    console.log('getResults method returns correct results object')
    const testlib = new TestLib();
    testlib.tallies = tallies;
    testlib.description = description;
    // testlib.complete must be set to true for promise in getResults to resolve
    testlib.complete = true;
    const expectedResults = { tallies, description };
    const results = await testlib.getResults();
    assertEquals(results, expectedResults);
}

async function runMethod() {
    console.log('run method calls correct methods and sets correct properties');
    const testlib = new TestLib();
    const expectedMethodCalls = [INITIALIZE_TEST_DATA, CONSOLE_LOG_TEST, CALLBACK_ARG];
    const actualMethodCalls = [];
    testlib.initializeTestData = () => actualMethodCalls.push(INITIALIZE_TEST_DATA);
    console.logTest = () => actualMethodCalls.push(CONSOLE_LOG_TEST);
    await testlib.run(description, () => actualMethodCalls.push(CALLBACK_ARG));
    assertEquals(testlib.complete, true);
    assertEquals(testlib.description, description);
    assertEquals(actualMethodCalls, expectedMethodCalls)
}

async function testMethod() {
    console.log('test method executes callbacks and sets correct properties');
    const testlib = new TestLib();
    const expectedMethodCalls = [CONSOLE_LOG_TEST, EXECUTE_BEFORE_CALLBACKS, CALLBACK_ARG, INCREMENT_TESTS_TALLY];
    let actualMethodCalls = [];
    testlib.getFixtureArgsFromParams = () => [];
    testlib.tallies = { [TESTS]: { ...tallies[TESTS] }, [ASSERTIONS]: { ...tallies[TESTS] }};
    testlib.incrementTestsTally = () => actualMethodCalls.push(INCREMENT_TESTS_TALLY);
    testlib.executeBeforeEachCallbacks = () => actualMethodCalls.push(EXECUTE_BEFORE_CALLBACKS);
    console.logTest = () => actualMethodCalls.push(CONSOLE_LOG_TEST);
    await testlib.test(description, () => actualMethodCalls.push(CALLBACK_ARG));
    assertEquals(actualMethodCalls, expectedMethodCalls);
    // TODO: separate out the failed vs pass test states into different tests
    actualMethodCalls = [];
    testlib.alertTestFailure = () => actualMethodCalls.push(ALERT_TEST_FAILURE);
    await testlib.test(description, () => { 
        testlib.tallies[ASSERTIONS][FAILED] = 1;
        actualMethodCalls.push(CALLBACK_ARG);
    });
    assertEquals(actualMethodCalls, [...expectedMethodCalls, ALERT_TEST_FAILURE]);
}

function executeBeforeEachCallbacksMethod() {
    console.log('executeBeforeEachCallbacks method executes the before each callbacks');
    const testlib = new TestLib();
    const expectedMethodCalls = [GET_FIXTURE_ARGS_FROM_PARAMS, EXECUTE_BEFORE_CALLBACKS, GET_FIXTURE_ARGS_FROM_PARAMS, EXECUTE_BEFORE_CALLBACKS];
    const actualMethodCalls = [];
    testlib.beforeEachCallbacks = [
        () => actualMethodCalls.push(EXECUTE_BEFORE_CALLBACKS), 
        () => actualMethodCalls.push(EXECUTE_BEFORE_CALLBACKS)
    ];
    testlib.getFixtureArgsFromParams = () => {
        actualMethodCalls.push(GET_FIXTURE_ARGS_FROM_PARAMS);
        return [];
    };
    testlib.executeBeforeEachCallbacks();
    assertEquals(actualMethodCalls, expectedMethodCalls);
}

function beforeEachMethod() {
    console.log('beforeEach method adds a function to the beforeEachCallback array');
    const testlib = new TestLib();
    testlib.beforeEachCallbacks = [];
    testlib.beforeEach(() => {});
    testlib.beforeEach(console.log);
    assertEquals(testlib.beforeEachCallbacks.length, 2);
    // TODO: make new test for non-function not being added to beforeEachCallback array
    testlib.beforeEach(1);
    testlib.beforeEach('test');
    assertEquals(testlib.beforeEachCallbacks.length, 2);
}

function alertTestFailureMethod() {
    console.log('alertTestFailure method performs the correct action');
    const testlib = new TestLib();
    const expectedMethodCalls = [CONSOLE_LOG_TEST];
    const actualMethodCalls = [];
    console.logTest = () => actualMethodCalls.push(CONSOLE_LOG_TEST);
    testlib.alertTestFailure();
    assertEquals(actualMethodCalls, expectedMethodCalls);
}

async function waitForMethod() {
    console.log('waitFor method works as a promise wrapper');
    const testlib = new TestLib();
    const expectedMethodCalls = [CALLBACK_ARG];
    const actualMethodCalls = [];
    await testlib.waitFor(res => {
        setTimeout(() => {
            actualMethodCalls.push(CALLBACK_ARG);
            res();
        });
    });
    assertEquals(actualMethodCalls, expectedMethodCalls);
}

function incrementTallyMethod() {
    console.log('incrementTally method increments the correct tallies');
    const testlib = new TestLib();
    testlib.tallies = { [TESTS]: { ...tallies[TESTS] }, [ASSERTIONS]: { ...tallies[ASSERTIONS] }};
    testlib.incrementTally(TESTS, PASSED);
    testlib.incrementTally(TESTS, FAILED);
    testlib.incrementTally(ASSERTIONS, PASSED);
    testlib.incrementTally(ASSERTIONS, FAILED);
    for (let tally in testlib.tallies) {
        assertEquals(testlib.tallies[tally][PASSED], 1);
        assertEquals(testlib.tallies[tally][FAILED], 1);
    }
}

function incrementTestsTallyMethod() {
    console.log('incrementTestsTally method increments the test tallies');
    const testlib = new TestLib();
    testlib.tallies = { [TESTS]: { ...tallies[TESTS] }, [ASSERTIONS]: { ...tallies[ASSERTIONS] }};
    testlib.incrementTestsTally(PASSED);
    testlib.incrementTestsTally(FAILED);
    assertEquals(testlib.tallies[TESTS][PASSED], 1);
    assertEquals(testlib.tallies[TESTS][FAILED], 1);
    assertEquals(testlib.tallies[ASSERTIONS][PASSED], 0);
    assertEquals(testlib.tallies[ASSERTIONS][FAILED], 0);
}

function incrementAssertionsTallyMethod() {
    console.log('incrementTally method increments the assertions tallies');
    const testlib = new TestLib();
    testlib.tallies = { [TESTS]: { ...tallies[TESTS] }, [ASSERTIONS]: { ...tallies[ASSERTIONS] }};
    testlib.incrementAssertionsTally(PASSED);
    testlib.incrementAssertionsTally(FAILED);
    assertEquals(testlib.tallies[ASSERTIONS][PASSED], 1);
    assertEquals(testlib.tallies[ASSERTIONS][FAILED], 1);
    assertEquals(testlib.tallies[TESTS][PASSED], 0);
    assertEquals(testlib.tallies[TESTS][FAILED], 0);
}

function getTallyMethod() {
    console.log('getTally method returns the tallies');
    const testlib = new TestLib();
    testlib.tallies = { [ASSERTIONS]: { [PASSED]: 100, [FAILED]: 50 }, [TESTS]: { [PASSED]: 5, [FAILED]: 20 }};
    const assertionTallies = testlib.getTally([ASSERTIONS]);
    const testsTallies = testlib.getTally(TESTS);
    assertEquals(assertionTallies, testlib.tallies[ASSERTIONS]);
    assertEquals(testsTallies, testlib.tallies[TESTS]);
}

function handleAssertionPassMethod() {
    console.log('handleAssertPass method calls correct method');
    const testlib = new TestLib();
    let passVar;
    testlib.incrementAssertionsTally = () => passVar = PASSED;
    testlib.handleAssertionPass();
    assertEquals(passVar, PASSED);
}

function handleAssertionFailMethod() {
    console.log('handleAssertionFail method calls correct methods');
    const expectedLogs = ['testing', '1234'];
    const actualLogs = [];
    console.logAssert = (str) => actualLogs.push(str);
    const testlib = new TestLib();
    let failVar;
    testlib.incrementAssertionsTally = () => failVar = FAILED;
    testlib.handleAssertionFail(expectedLogs[1], expectedLogs[0]);
    assertEquals(failVar, FAILED);
    assertEquals(actualLogs, expectedLogs);
}

function logTestResultsMethod() {
    console.log('logTestResults method logs the test results');
    const testlib = new TestLib();
    let logCount = 0;
    console.logResult = () => logCount++;
    testlib.logTestResults([{ tallies }]);
    // TODO: make test less brittle
    assertEquals(logCount > 3, true);
}


async function runSelfTests() {
    console.log('========== TestLib ============');
    newTestlibInstanceInitialized();
    initializeTestDataMethod();
    await getResultsMethod();
    await runMethod();
    await testMethod();
    executeBeforeEachCallbacksMethod();
    beforeEachMethod();
    alertTestFailureMethod();
    await waitForMethod();
    incrementTallyMethod();
    incrementTestsTallyMethod();
    incrementAssertionsTallyMethod();
    getTallyMethod();
    handleAssertionPassMethod();
    handleAssertionFailMethod();
    logTestResultsMethod();
    // TODO: fixtureProvider, assertions, and spy tests
}

runSelfTests();