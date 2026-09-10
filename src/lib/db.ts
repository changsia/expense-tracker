import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
	console.warn('Supabase credentials not set — app will not connect to database.');
}

export const supabase: SupabaseClient = createClient(
	SUPABASE_URL ?? '',
	SUPABASE_ANON_KEY ?? ''
);

export interface Expense {
	id: number;
	person: string;
	amount: number;
	currency: string;
	description: string;
	created_at: string;
	user_id: string;
}

export async function insertExpense(expense: Omit<Expense, 'id' | 'created_at'>) {
	const { data, error } = await supabase
		.from('expenses')
		.insert(expense)
		.select()
		.single();

	if (error) throw error;
	return data;
}

export async function getExpenses(): Promise<Expense[]> {
	const { data, error } = await supabase
		.from('expenses')
		.select('*')
		.order('created_at', { ascending: false });

	if (error) throw error;
	return data ?? [];
}

export async function deleteExpense(id: number) {
	const { error } = await supabase
		.from('expenses')
		.delete()
		.eq('id', id);

	if (error) throw error;
}

export async function getPersonSummaries(): Promise<Array<{ person: string; total: number; currency: string }>> {
	const { data, error } = await supabase
		.from('expenses')
		.select('person, amount, currency')
		.order('created_at', { ascending: false });

	if (error) throw error;

	const map = new Map<string, { person: string; total: number; currency: string }>();
	for (const e of data ?? []) {
		const key = `${e.person}::${e.currency}`;
		const existing = map.get(key);
		if (existing) {
			existing.total += e.amount;
		} else {
			map.set(key, { person: e.person, total: e.amount, currency: e.currency });
		}
	}
	return Array.from(map.values());
}
