-- Wipe ALL auth emails so Admin / Employee can register fresh.
--
-- How to run:
--   1. Open Supabase Dashboard → SQL Editor → New query
--   2. Paste this entire file
--   3. Click Run
--
-- WARNING: irreversible. Deletes every Auth user and cascaded app rows
-- (profiles, workspace, integrations, leave_requests, etc.).

-- Clear dependent auth tables first (safe if already empty)
truncate table
  auth.refresh_tokens,
  auth.sessions,
  auth.mfa_amr_claims,
  auth.mfa_challenges,
  auth.mfa_factors,
  auth.identities,
  auth.one_time_tokens
cascade;

-- Delete every registered email / password account
delete from auth.users;

-- Confirm wipe (should return 0)
select count(*) as remaining_auth_users from auth.users;
