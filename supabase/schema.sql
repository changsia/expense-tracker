-- expenses table
CREATE TABLE expenses (
	id          BIGSERIAL PRIMARY KEY,
	user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
	person      TEXT NOT NULL,
	amount      NUMERIC(10,2) NOT NULL CHECK (amount > 0),
	currency    TEXT NOT NULL DEFAULT 'RM',
	description TEXT NOT NULL DEFAULT '',
	created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: users can only see their own expenses
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own expenses"
	ON expenses FOR ALL
	USING (auth.uid() = user_id);

-- indexes
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_created_at ON expenses(created_at DESC);
