# CMS OAuth provider

Decap CMS's GitHub backend needs a small OAuth "handshake" server to turn
a GitHub login into a token it can use to commit content changes.
Netlify ships one built in ("Git Gateway"); Cloudflare Pages doesn't, so
this is a ~60-line worker that does the same job. It is deployed
separately from the main site (different `wrangler.toml`, different
worker) because it's a distinct piece of infrastructure with its own
secrets — see `docs/decisions/0005-cms-decap.md`.

## One-time setup

1. **Create a GitHub OAuth App**: GitHub → Settings → Developer settings →
   OAuth Apps → New OAuth App.
   - Homepage URL: `https://akarohanrealtors.com`
   - Authorization callback URL: `https://ak-realtors-cms-oauth.<your-subdomain>.workers.dev/callback`
   - Note the Client ID and generate a Client Secret.

2. **Deploy this worker**:
   ```sh
   cd cms-oauth
   npx wrangler deploy
   npx wrangler secret put GITHUB_OAUTH_CLIENT_ID
   npx wrangler secret put GITHUB_OAUTH_CLIENT_SECRET
   ```

3. **Point the CMS at it**: in `public/admin/config.yml`, set
   `backend.base_url` to the worker's URL (e.g.
   `https://ak-realtors-cms-oauth.<your-subdomain>.workers.dev`).

4. **Grant repo access**: whoever logs into `/admin` must have write
   access to the `anmishra-a/akrealtors` GitHub repo — add them as a
   collaborator if they don't already have it.

Once this is done, visiting `https://akarohanrealtors.com/admin/` and
clicking "Login with GitHub" commits content edits straight to the
repo's `main` branch (via Decap's editorial workflow — see the CMS
config), which triggers a normal Cloudflare Pages build and deploy. No
separate CMS hosting, no database.
