<script lang="ts">
	import { onMount } from 'svelte';
	import { parseExpense } from '$lib/parser';
	import { supabase, insertExpense, getExpenses, deleteExpense, type Expense } from '$lib/db';
	import type { Session } from '@supabase/supabase-js';

	let session: Session | null = $state(null);
	let loading = $state(true);
	let expenses: Expense[] = $state([]);
	let input = $state('');
	let error = $state('');
	let personSummaries = $state<Array<{ person: string; total: number; currency: string }>>([]);

	// Check auth state on mount
	onMount(async () => {
		const { data } = await supabase.auth.getSession();
		session = data.session;
		loading = false;

		if (session) {
			await loadData();
		}
	});

	// Listen to auth changes
	supabase.auth.onAuthStateChange((_event, session_) => {
		session = session_;
		if (session_) {
			loadData();
		} else {
			expenses = [];
		}
	});

	async function signIn() {
		const { error: signInError } = await supabase.auth.signInWithOtp({
			email: 'you@example.com', // replace with real email or prompt user
			options: { shouldCreateUser: true }
		});
		if (signInError) error = 'Sign in failed: ' + signInError.message;
	}

	async function signOut() {
		await supabase.auth.signOut();
	}

	async function loadData() {
		try {
			const data = await getExpenses();
			expenses = data;
			// Build person summaries from current data
			const map = new Map<string, { person: string; total: number; currency: string }>();
			for (const e of data) {
				const key = `${e.person}::${e.currency}`;
				const existing = map.get(key);
				if (existing) {
					existing.total += e.amount;
				} else {
					map.set(key, { person: e.person, total: e.amount, currency: e.currency });
				}
			}
			personSummaries = Array.from(map.values());
		} catch (e) {
			error = 'Failed to load expenses.';
		}
	}

	async function handleAdd() {
		if (!input.trim()) return;
		const parsed = parseExpense(input);
		if (!parsed) {
			error = "Can't parse — try: 'bobby paid rm5 for fries'";
			return;
		}
		error = '';
		try {
			await insertExpense({
				user_id: session!.user.id,
				person: parsed.person,
				amount: parsed.amount,
				currency: parsed.currency,
				description: parsed.description || parsed.person
			});
			input = '';
			await loadData();
		} catch (e: unknown) {
			error = 'Failed to save expense.';
		}
	}

	async function handleDelete(id: number) {
		try {
			await deleteExpense(id);
			await loadData();
		} catch {
			error = 'Failed to delete.';
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') handleAdd();
	}
</script>

<!-- Auth gate -->
{#if loading}
	<p class="auth-info">Loading...</p>
{:else if !session}
	<div class="container">
		<div class="auth-info">
			<p style="margin-bottom: 16px;">Sign in to start tracking expenses.</p>
			<button class="btn-auth" onclick={signIn}>Send Magic Link</button>
		</div>
	</div>
{:else}
	<div class="container">
		<div class="header">
			<h1>Expenses</h1>
			<button class="btn-auth" onclick={signOut}>Sign out</button>
		</div>

		<!-- Error toast -->
		{#if error}
			<p style="color: var(--danger); font-size: 0.875rem; margin-bottom: 8px;">{error}</p>
		{/if}

		<!-- Expense list -->
		{#if expenses.length === 0}
			<div class="empty">
				<p>No expenses yet.</p>
				<p style="font-size: 0.8rem; margin-top: 4px;">Type below to add one.</p>
			</div>
		{:else}
			<div class="expense-list">
				{#each expenses as expense (expense.id)}
					<div class="expense-card">
						<div class="info">
							<div class="person">{expense.person}</div>
							<div class="desc">{expense.description}</div>
							<div class="meta">{new Date(expense.created_at).toLocaleDateString()}</div>
						</div>
						<div class="amount">{expense.currency}{expense.amount.toFixed(2)}</div>
						<button class="delete-btn" onclick={() => handleDelete(expense.id)} title="Delete">&times;</button>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Person summary -->
		{#if personSummaries.length > 0}
			<div class="summary">
				<h2>Summary by person</h2>
				{#each personSummaries as s}
					<div class="summary-row">
						<span class="name">{s.person}</span>
						<span>{s.currency}{s.total.toFixed(2)}</span>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Sticky input bar -->
	<div class="input-area">
		<div class="input-row">
			<input
				type="text"
				placeholder="bobby paid rm5 for fries"
				value={input}
				oninput={(e) => input = e.currentTarget.value}
				onkeydown={handleKeydown}
			/>
			<button onclick={handleAdd}>Add</button>
		</div>
		<div class="hint">Try: bobby paid rm5 for fries</div>
	</div>
{/if}
