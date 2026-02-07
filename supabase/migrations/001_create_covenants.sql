CREATE TABLE covenants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  display_name TEXT DEFAULT 'Anonymous',
  answers JSONB NOT NULL,
  covenant_text TEXT NOT NULL,
  upvotes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE covenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read covenants" ON covenants FOR SELECT USING (true);
CREATE POLICY "Anyone can insert covenants" ON covenants FOR INSERT WITH CHECK (true);
