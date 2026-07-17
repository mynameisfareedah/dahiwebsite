## Security Notes and Immediate Actions

This project contained a development helper and a permissive migration that were temporarily added for testing. Those artifacts have been removed from the repository. Follow the steps below immediately if a Supabase service role key was exposed.

1) Rotate compromised keys (IMMEDIATE)
- Open Supabase Dashboard → Project → Settings → API.
- Regenerate the **Service Role** key (and JWT secret if present). Treat the old key as revoked.
- Update any server environment variables with the new key and redeploy.

2) Revoke and audit (IMMEDIATE)
- Check database logs and application logs for suspicious activity since the key exposure.
- Remove any test data or rows inserted during the exposure window if necessary.

3) Remove dev artifacts (done)
- Development-only migration and helper files that allowed bypassing RLS were deleted from this repository.
- If you deployed these helpers anywhere (serverless functions, Netlify, Vercel), remove those deployments and delete any copies of the service role key stored there.

4) Restore RLS policies
- If you applied a permissive policy in the database for testing, remove it. Use the Supabase SQL editor to run an appropriate `DROP POLICY` statement or revert your migration.

5) Replace with secure alternatives
- Use the anon key and authenticated sessions for client-side operations.
- For server-side operations requiring elevated privileges, keep the service role key strictly server-side and use short-lived or scoped tokens when possible.

6) Best practices
- Store secrets in a secret manager (AWS Secrets Manager, Azure Key Vault, GitHub Actions secrets, etc.).
- Do not paste service role keys into chat, code comments, or public issue trackers.
- Rotate keys periodically and after any personnel change.

If you want, I can:
- Add CI checks to prevent committing `.env` or files containing sensitive keys.
- Add a small script to detect service-role-like tokens in commits (pre-commit hook).

If you rotated the service role key, tell me and I will help reconfigure any server runtimes and re-run tests.
