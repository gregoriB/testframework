function assertEquals(actual, expected) {
    if (isObjectOrArray(actual)) {
        actual = stringifyObject(actual);
    }
    if (isObjectOrArray(expected)) {
        expected = stringifyObject(expected);
    }
    if (actual !== expected) {
        console.error('FAILED')
        throw new Error(`${actual} does not equal ${expected}`);
    }
    console.log('PASSED')
}

function isObjectOrArray(arg) {
    return typeof arg === 'object';
}

function orderObject(obj) {
    const keys = Object.keys(obj);
    keys.sort();
    return keys.reduce((acc, curr) => {
        acc[curr] = obj[curr];
        return acc;
    }, {});
}

function stringifyObject(obj) {
    if (!Array.isArray(obj)) {
        obj = orderObject(obj);
    }
    return JSON.stringify(obj);
}

module.exports = {
    assertEquals,
}