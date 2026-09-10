import { parseExpense } from './parser';

const tests: Array<{ input: string; expected: { person: string; amount: number; currency: string; description: string } | null }> = [
	{ input: 'bobby paid rm5 for fries', expected: { person: 'bobby', amount: 5, currency: 'RM', description: 'fries' } },
	{ input: 'RM15 coffee', expected: { person: 'me', amount: 15, currency: 'RM', description: 'coffee' } },
	{ input: 'spent 5 on bus', expected: { person: 'me', amount: 5, currency: 'RM', description: 'bus' } },
	{ input: '5 ringgit fries', expected: { person: 'me', amount: 5, currency: 'RM', description: 'fries' } },
	{ input: 'paid rm10 for noodles', expected: { person: 'me', amount: 10, currency: 'RM', description: 'noodles' } },
	{ input: 'jane gave rm20 dinner', expected: { person: 'jane', amount: 20, currency: 'RM', description: 'dinner' } },
	{ input: '', expected: null },
	{ input: 'no money here', expected: null },
	{ input: '$5 lunch', expected: { person: 'me', amount: 5, currency: '$', description: 'lunch' } },
	{ input: 'RM50.50 birthday dinner', expected: { person: 'me', amount: 50.5, currency: 'RM', description: 'birthday dinner' } },
];

let passed = 0;
let failed = 0;

for (const { input, expected } of tests) {
	const result = parseExpense(input);
	const ok = JSON.stringify(result) === JSON.stringify(expected);
	if (ok) {
		passed++;
	} else {
		failed++;
		console.error(`FAIL: "${input}"`);
		console.error(`  expected: ${JSON.stringify(expected)}`);
		console.error(`  got:      ${JSON.stringify(result)}`);
	}
}

console.log(`\n${passed}/${tests.length} passed${failed ? ` (${failed} failed)` : ' ✓'}`);
if (failed) process.exit(1);
