CREATE INDEX IF NOT EXISTS reviews_branch_date_id_idx ON reviews (branch_id, created_at DESC, id ASC);
