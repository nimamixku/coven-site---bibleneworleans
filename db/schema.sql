-- Schema for the BOOTH feature — a text booth ("ask a question, get an
-- answer") that generates a response in COVEN of New Orleans's own voice,
-- grounded in the real writing already on bibleneworleans.com (the
-- covenant, testing-the-matrix, glossary, covenisms, prayers). Every
-- answer is machine-generated and clearly labeled as such — no human
-- reads or writes these live. Owner-only to trigger for now (keeps real
-- API cost bounded to your own testing); can be opened to visitors later
-- by relaxing the check in app/api/booth/route.js — this table and its
-- shape don't need to change either way.

create table if not exists booth_log (
  id bigserial primary key,
  question text not null,
  answer text,
  broke_character boolean not null default false, -- true if the safety fallback triggered instead of a normal in-voice answer
  cost_usd double precision, -- the real Anthropic API cost of this one reading (Haiku 4.5 rates), shown on the booth's sign graphic instead of a joke nickel
  ip_hash text,
  created_at timestamptz not null default now()
);

create index if not exists booth_log_created_at_idx on booth_log (created_at desc);
