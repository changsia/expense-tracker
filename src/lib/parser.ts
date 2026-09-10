export interface ParsedExpense {
	person: string;
	amount: number;
	currency: string;
	description: string;
}

export function parseExpense(text: string): ParsedExpense | null {
	const trimmed = text.trim();
	if (!trimmed) return null;

	let amount: number | null = null;
	let currency = 'RM';

	// Match currency+amount: RM5, $5, 5 ringgit, 5 cny, etc.
	const patterns: Array<{ regex: RegExp; currency: string }> = [
		{ regex: /\b(rm|myr)\s*(\d+(?:\.\d+)?)/i, currency: 'RM' },
		{ regex: /\$ ?(\d+(?:\.\d+)?)/, currency: '$' },
		{ regex: /(\d+(?:\.\d+)?)\s*ringgit(?:\s*malaysia)?/i, currency: 'RM' },
		{ regex: /(\d+(?:\.\d+)?)\s*usd\b/i, currency: 'USD' },
		{ regex: /(\d+(?:\.\d+)?)\s*(?:cny|yuan|rmb)\b/i, currency: 'CNY' },
	];

	for (const { regex, currency: cur } of patterns) {
		const m = trimmed.match(regex);
		if (m) {
			const num = m[m.length - 1];
			if (num && !isNaN(parseFloat(num))) {
				amount = parseFloat(num);
				currency = cur;
				break;
			}
		}
	}

	// Fallback: bare number after action keyword
	if (amount === null) {
		const bare = trimmed.match(/\b(paid|spent|cost|for|bought)\s+(\d+(?:\.\d+)?)/i);
		if (bare) {
			amount = parseFloat(bare[2]);
		}
	}

	if (amount === null || amount <= 0) return null;

	// Determine if an action verb is present and where
	const actionMatch = /\b(paid|spent|cost|bought|gave)\b/i.exec(trimmed);
	const hasAction = !!actionMatch;
	const actionAtStart = actionMatch?.index === 0;

	// Clean: remove currency+amount patterns and action words
	let clean = trimmed
		.replace(/\b(rm|myr)\s*\d+(?:\.\d+)?\b/gi, '')
		.replace(/\$ ?\d+(?:\.\d+)?/g, '')
		.replace(/\d+(?:\.\d+)?\s*ringgit(?:\s*malaysia)?\b/gi, '')
		.replace(/\d+(?:\.\d+)?\s*(?:usd|cny|yuan|rmb)\b/gi, '')
		.replace(/\b(?:paid|spent|cost|for|bought|gave|checkout|cheque|on|the|a|an|at|by|with)\b/gi, '')
		.replace(/\b(rm|myr|ringgit|ringgit malaysia|yuan|rmb|usd)\b/gi, '')
		.replace(/[,.!?;]+/g, '')
		.replace(/\s+/g, ' ')
		.trim();

	// Strip the amount number itself if it's still in the text (bare number case)
	const numericClean = clean.replace(new RegExp(`\\b${amount}\\b`), '').trim();
	if (numericClean !== clean) {
		clean = numericClean.replace(/\s+/g, ' ').trim();
	}

	let person = 'me';
	let description = clean;

	if (hasAction && !actionAtStart) {
		const words = clean.split(/\s+/);
		const first = words[0];
		if (first && words.length > 1 && !/^\d+(\.\d+)?$/.test(first)) {
			person = first.toLowerCase();
			description = words.slice(1).join(' ');
		}
	}

	if (!description) description = 'expense';

	return { person, amount, currency, description };
}
