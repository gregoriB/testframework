const { orderObject, prepareObject } = require('../utils.js'); 

function assertEquals(actual, expected, debug) {
    if (typeof actual === 'object') {
        actual = prepareObject(actual);
    }
    if (typeof expected === 'object') {
        expected = prepareObject(expected);
    }
    if (actual !== expected) {
        if (!debug) {
            console.error('FAILED')
            throw new Error(`${actual} does not equal ${expected}`);
        }
        return false;
    }
    return true;
}

function Counter(_count = 0) {
    return {
        increment: () => _count++,
        getCount: () => _count,
    }
}

module.exports = {
    assertEquals,
    Counter,
}

/* ================= UNIT TESTS ====================== */

function testOrderObject() {
    console.log('orderObject sorts the object');
    const obj = { test: 'test', 3: '3', alpha: 'a', list: [], obj: {} };
    const orderedObj = orderObject(obj);
    const orderedObjKeys = Object.keys(orderedObj);
    const orderedObjKeysSorted = [ ...Object.keys(orderedObj).sort() ];
    orderedObjKeys.forEach((key, i) => {
        if (key !== orderedObjKeysSorted[i]) {
            throw new Error(`Object is not sorted`);
        }
    });
}

function testPrepareObject() {
    console.log('preparedObject sorts and stringifies object, does not sort arrays');
    const obj = { test: 'test', 3: '3', alpha: 'a', list: [], obj: {} };
    const arr = ['test', 3, 'a'];
    const prepObj = prepareObject(obj);
    const prepArr = prepareObject(arr);
    if (typeof prepObj !== 'string') {
        throw new Error(`${prepObj} is not a string`);
    }
    if (typeof prepArr !== 'string') {
        throw new Error(`${prepArr} is not a string`);
    }
    const unpreppredArr = JSON.parse(prepArr);
    arr.forEach((item, i) => {
        if (item !== unpreppredArr[i]) {
            throw new Error(`${item} does not match ${unpreppredArr[i]}`);
        }
    });
    const unpreppedObj = JSON.parse(prepObj);
    const objKeys = Object.keys(obj).sort();
    const unpreppredObjKeys = Object.keys(unpreppedObj);
    if (!unpreppredObjKeys.length) {
        throw new Error(`${unpreppredObjKeys} is not an array of keys`);
    }
    objKeys.forEach((key, i) => {
        if (key !== unpreppredObjKeys[i]) {
            throw new Error(`${unpreppedObj} is not sorted`);
        }
    });
}

function testAssertEquals() {
    console.log('assert equals should pass if equality criteria is met');
    const obj = { test: 'test', 3: '3', alpha: 'a', list: [], obj: {} };
    const arr = ['test', 3, 'a'];
    const num = 597634;
    const str = 'some test string';
    const bool = true;
    const debug = true;
    const tests = [
        { key: 'obj', result: assertEquals(obj, { ...obj }, debug), expected: true },
        { key: 'arr', result: assertEquals(arr, [ ...arr ], debug), expected: true },
        { key: 'num', result: assertEquals(num, num, debug), expected: true },
        { key: 'str', result: assertEquals(str, str, debug), expected: true },
        { key: 'bool', result: assertEquals(bool, bool, debug), expected: true },
        { key: 'obj', result: assertEquals(obj, { ...obj, 1: 'one' }, debug), expected: false },
        { key: 'arr', result: assertEquals(arr, [ ...arr, 1 ], debug), expected: false },
        { key: 'num', result: assertEquals(num, 1, debug), expected: false },
        { key: 'str', result: assertEquals(str, 'not the string', debug), expected: false },
        { key: 'bool', result: assertEquals(bool, !bool, debug), expected: false },
    ];
    tests.forEach(test => {
        if (test.result !== test.expected) {
            throw new Error(`${test.key} failed the equality check`);
        }
    });
}

function testCounter() {
    console.log('TEST COUNTER:');
    function newCounterIsIntialized() {
        console.log('new counter is initialized');
        const counter = new Counter();
        if (typeof counter !== 'object') {
            throw new Error('Counter was not initialized');
        }
    }

    function counterIncrements() {
        const counter = new Counter();
        counter.increment();
        if (counter.getCount() !== 1) {
            throw new Error('Counter does not increment');
        }
        counter.increment();
        if (counter.getCount() !== 2) {
            throw new Error('Counter does not increment beyond 1');
        }
    }

    newCounterIsIntialized();
    counterIncrements();
}

function runSelfTests() {
    console.log('\n ========== Self Test Utils ============ \n');
    console.log('\n - UTILS - \n');
    testOrderObject();
    testPrepareObject();
    testAssertEquals();
    testCounter();
}

runSelfTests();