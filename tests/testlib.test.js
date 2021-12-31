const TestLib = require('../TestLib');
const { PASSED, FAILED, ASSERTIONS, TESTS } = require('../constants');
const { assertEquals, Counter } = require('./utils.js');

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
const INITIALIZE_REPORT = 'initializeReport';
const UPDATE_REPORT = 'updateReport';

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

function assertions() {
    console.log('\n - ASSERTIONS - \n');
    const testlib = new TestLib();
    const testObj = { [TESTS]: { ...tallies[TESTS] }, [ASSERTIONS]: { ...tallies[ASSERTIONS] }};
    testlib.tallies = testObj;
    const testArr = [1, 'two', false, null, undefined, testObj, []];
    const testKeys = ['one', 2, 'three', 4, 'five', 6];
    const methods = testlib.getTestMethods();

    function equal() {
        console.log('EQUAL:')
        const testMethod = methods.assert.equal;
        function pass() {
            console.log(' method passes');
            const counter = new Counter();
            testlib.handleAssertionPass = counter.increment;
            testMethod(tallies, testObj);
            assertEquals(counter.getCount(), 1);
            testMethod(testArr, [...testArr]);
            assertEquals(counter.getCount(), 2);
            testMethod(1, 1);
            assertEquals(counter.getCount(), 3);
            testMethod('one', 'one');
            assertEquals(counter.getCount(), 4);
            testMethod(true, true);
            assertEquals(counter.getCount(), 5);
        }

        function fail() {
            console.log(' method fails');
            const counter = new Counter();
            testlib.handleAssertionFail = counter.increment;
            testMethod(tallies, { ...testObj, 1: 'one' });
            assertEquals(counter.getCount(), 1);
            testMethod(testArr, [...testArr, 0]);
            assertEquals(counter.getCount(), 2);
            testMethod(1, 2);
            assertEquals(counter.getCount(), 3);
            testMethod('one', 'two');
            assertEquals(counter.getCount(), 4);
            testMethod(true, false);
            assertEquals(counter.getCount(), 5);
        }

        pass();
        fail();
    }

    function notEqual() {
        console.log('NO EQUAL:')
        const testMethod = methods.assert.notEqual;
        function pass() {
            console.log(' method passes');
            const counter = new Counter();
            testlib.handleAssertionPass = counter.increment;
            testMethod(tallies, { ...testObj, 1: 'one' });
            assertEquals(counter.getCount(), 1);
            testMethod(testArr, [...testArr, 0]);
            assertEquals(counter.getCount(), 2);
            testMethod(1, 2);
            assertEquals(counter.getCount(), 3);
            testMethod('one', 'two');
            assertEquals(counter.getCount(), 4);
            testMethod(true, false);
            assertEquals(counter.getCount(), 5);
        }

        function fail() {
            console.log(' method fails');
            const counter = new Counter();
            testlib.handleAssertionFail = counter.increment;
            testMethod(tallies, testObj);
            assertEquals(counter.getCount(), 1);
            testMethod(testArr, [...testArr]);
            assertEquals(counter.getCount(), 2);
            testMethod(1, 1);
            assertEquals(counter.getCount(), 3);
            testMethod('one', 'one');
            assertEquals(counter.getCount(), 4);
            testMethod(true, true);
            assertEquals(counter.getCount(), 5);
        }

        pass();
        fail();
    }

    function hasKeys() {
        console.log('HAS KEYS:')
        const testMethod = methods.assert.hasKeys;
        const testObjWithKeys = testKeys.reduce((acc, curr) => {
            acc[curr] = null;
            return acc;
        }, {});

        function pass() {
            console.log(' method passes');
            const counter = new Counter();
            testlib.handleAssertionPass = counter.increment;
            testMethod(testObjWithKeys, testKeys);
            assertEquals(counter.getCount(), 1);
            testMethod({ ...testObjWithKeys, test: 'test' }, testKeys);
            assertEquals(counter.getCount(), 2);
        }

        function fail() {
            console.log(' method fails');
            const counter = new Counter();
            testlib.handleAssertionFail = counter.increment;
            testMethod(testObjWithKeys, [ 1, 2, 3, 4, 5 ]);
            assertEquals(counter.getCount(), 1);
        }

        pass();
        fail();
    }

    function hasValues() {
        console.log('HAS VALUES:')
        const testMethod = methods.assert.hasValues;
        const testObjWithValues = testKeys.reduce((acc, curr, i) => {
            acc[curr] = testArr[i];
            return acc;
        }, {});

        function pass() {
            console.log(' method passes');
            const counter = new Counter();
            testlib.handleAssertionPass = counter.increment;
            testMethod(testObjWithValues, testObjWithValues);
            assertEquals(counter.getCount(), 1);
        }

        function fail() {
            console.log(' method fails');
            const counter = new Counter();
            testlib.handleAssertionFail = counter.increment;
            testMethod(testObjWithValues, {});
            assertEquals(counter.getCount(), 1);
        }

        pass();
        fail();
    }

    function isNotUndefined() {
        console.log('IS NOT UNDEFINED:')
        const testMethod = methods.assert.isNotUndefined;

        function pass() {
            console.log(' method passes');
            const counter = new Counter();
            testlib.handleAssertionPass = counter.increment;
            testMethod(1);
            testMethod('one');
            testMethod(null);
            testMethod(false);
            testMethod(true);
            testMethod({});
            testMethod([]);
            assertEquals(counter.getCount(), 7);
        }

        function fail() {
            console.log(' method fails');
            const counter = new Counter();
            testlib.handleAssertionFail = counter.increment;
            testMethod(undefined);
            assertEquals(counter.getCount(), 1);
        }

        pass();
        fail();
    }

    function isUndefined() {
        console.log('IS UNDEFINED')
        const testMethod = methods.assert.isUndefined;

        function pass() {
            console.log(' method passes');
            const counter = new Counter();
            testlib.handleAssertionPass = counter.increment;
            testMethod(undefined);
            assertEquals(counter.getCount(), 1);
        }

        function fail() {
            console.log(' method fails');
            const counter = new Counter();
            testlib.handleAssertionFail = counter.increment;
            testMethod(1);
            testMethod('one');
            testMethod(null);
            testMethod(false);
            testMethod(true);
            testMethod({});
            testMethod([]);
            assertEquals(counter.getCount(), 7);
        }

        pass();
        fail();
    }

    equal();
    notEqual();
    hasKeys();
    hasValues();
    isNotUndefined();
    isUndefined();
}

function spy() {
    console.log('\n - SPY - \n');
    const testlib = new TestLib();
    const methods = testlib.getTestMethods();
    const testReports = { test: { args: [], returned: [], callCount: 0 }};

    function initializeNewSpy() {
        console.log('initialized a new spy class');
        const testSpy = methods.createSpy({ context: 'context' });
        assertEquals(typeof testSpy, 'object'); 
        assertEquals(testSpy.context, { context: 'context' });
        assertEquals(testSpy.reports, {});
    }

    function getReports() {
        console.log('GET REPORTS:');
        const testSpy = methods.createSpy({});
        testSpy.reports = { test: 'testing' }
        assertEquals(testSpy.getReports(), testSpy.reports);
    }
    
    function initializeReport() {
        console.log('INITIALIZE REPORT:')
        const testSpy = methods.createSpy({});
        testSpy.initializeReport('test');
        assertEquals(testSpy.reports, testReports);
    }

    function updateReport() {
        console.log('UPDATE REPORT');
        const testSpy = methods.createSpy({});
        testSpy.reports = { test: { ...testReports.test }};
        const testArgs = ['arg1', 'arg2'];
        const testReturned = ['return1', 'return2'];
        testSpy.updateReport('test', testArgs, testReturned);
        const expectedReport = { 
            test: { 
                args: [[0, testArgs]], 
                returned: [[0, testReturned]],
                callCount: 1,
            }
        }
        assertEquals(testSpy.reports, expectedReport);
    }

    function watch() {
        console.log('WATCH');
        const testSpy = methods.createSpy({});
        const expectedMethodCalls = [INITIALIZE_REPORT, UPDATE_REPORT];
        const actualMethodCalls = [];
        const testReturn = 'this is a return value';
        const testFunction = () => testReturn;
        const expectedArgs = ['arg1', 'arg2'];
        let actualArgs;
        let actualFnName;
        let actualReturned;
        testSpy.initializeReport = () => actualMethodCalls.push(INITIALIZE_REPORT);
        testSpy.updateReport = (fnName, args, returned) => {
            actualFnName = fnName;
            actualArgs = args;
            actualReturned = returned;
            actualMethodCalls.push(UPDATE_REPORT);
        };
        const testWatch = testSpy.watch(testFunction);
        testWatch(...expectedArgs);
        assertEquals(actualMethodCalls, expectedMethodCalls);
        assertEquals(actualFnName, 'testFunction');
        assertEquals(actualArgs, expectedArgs);
        assertEquals(actualReturned, testReturn);
    }

    initializeNewSpy();
    getReports();
    initializeReport();
    updateReport();
    watch();
}

async function mainClass() {
    console.log('\n - MAIN CLASS - \n')
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

async function runSelfTests() {
    console.log('\n ========== Testing Tools ============ \n');
    await mainClass();
    assertions();
    spy();
}

runSelfTests();