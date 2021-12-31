function assertEquals(actual, expected) {
    if (typeof actual === 'object') {
        if (actual.length === undefined) {
            actual = orderObject(actual);
        }
        actual = JSON.stringify(actual);
    }
    if (typeof expected === 'object') {
        if (expected.length === undefined) {
            expected = orderObject(expected);
        }
        expected = JSON.stringify(expected);
    }
    if (actual !== expected) {
        console.error('FAILED')
        throw new Error(`${actual} does not equal ${expected}`);
    }
    console.log('PASSED')
}

function orderObject(obj) {
    const keys = Object.keys(obj);
    keys.sort();
    return keys.reduce((acc, curr) => {
        acc[curr] = obj[curr];
        return acc;
    }, {});
}

module.exports = {
    assertEquals,
}