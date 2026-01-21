import { parseLrc } from './lrc-parser';


const testCases = [
    {
        input: '[00:00.25]Test line 1',
        expectedTime: 0.25,
        expectedText: 'Test line 1',
        expectedChorus: false,
    },
    {
        input: '[01:30.50]{chorus}Test line 2',
        expectedTime: 90.5,
        expectedText: 'Test line 2',
        expectedChorus: true,
    },
    // Extended formats
    {
        input: '[01:00:00.00]One hour',
        expectedTime: 3600,
        expectedText: 'One hour',
        expectedChorus: false,
    },
    {
        input: '[00:00:05]{sabi}Five seconds',
        expectedTime: 5,
        expectedText: 'Five seconds',
        expectedChorus: true,
    },
];

console.log('Running LRC Parser Tests...');

testCases.forEach((test, index) => {
    const result = parseLrc(test.input);
    if (result.length === 0) {
        console.error(`Test ${index + 1} failed: No result parsed`);
        return;
    }

    const line = result[0];
    const timeDiff = Math.abs(line.time - test.expectedTime);

    const chorusMatches = !!line.isChorus === !!test.expectedChorus;
    if (timeDiff < 0.01 && line.text === test.expectedText && chorusMatches) {
        console.log(`Test ${index + 1} passed`);
    } else {
        console.error(
            `Test ${index + 1} failed: Expected ${test.expectedTime}s "${test.expectedText}" chorus=${test.expectedChorus}, got ${line.time}s "${line.text}" chorus=${line.isChorus}`
        );
    }
});
