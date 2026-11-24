CREATE TABLE login_windows (
  key TEXT PRIMARY KEY,
  attempts INTEGER NOT NULL CHECK (attempts >= 0),
  expires_at TIMESTAMPTZ(3) NOT NULL
);
CREATE INDEX login_windows_expires_at_idx ON login_windows(expires_at);
