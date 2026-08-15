/**
 * Minimal GitHub OAuth provider for Decap CMS, deployed as its own small
 * Cloudflare Worker (separate from the main site) — see README.md in
 * this folder for the "why a separate worker" explanation and setup
 * steps, and docs/decisions/0005-cms-decap.md for the overall CMS
 * choice.
 *
 * Implements the standard two-endpoint handshake Decap's GitHub backend
 * expects:
 *   GET /auth      -> redirect to GitHub's OAuth authorize screen
 *   GET /callback  -> exchange the returned code for a token, then post
 *                     it back to the CMS popup window via postMessage
 *
 * Required secrets (wrangler secret put ...):
 *   GITHUB_OAUTH_CLIENT_ID
 *   GITHUB_OAUTH_CLIENT_SECRET
 */

const GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/auth") {
      const redirectUri = `${url.origin}/callback`;
      const authorizeUrl = new URL(GITHUB_AUTHORIZE_URL);
      authorizeUrl.searchParams.set("client_id", env.GITHUB_OAUTH_CLIENT_ID);
      authorizeUrl.searchParams.set("redirect_uri", redirectUri);
      authorizeUrl.searchParams.set("scope", "repo,user");
      return Response.redirect(authorizeUrl.toString(), 302);
    }

    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");
      if (!code) return new Response("Missing code", { status: 400 });

      const tokenRes = await fetch(GITHUB_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          client_id: env.GITHUB_OAUTH_CLIENT_ID,
          client_secret: env.GITHUB_OAUTH_CLIENT_SECRET,
          code,
        }),
      });
      const tokenData = await tokenRes.json();

      if (tokenData.error) {
        return new Response(`GitHub OAuth error: ${tokenData.error_description || tokenData.error}`, { status: 400 });
      }

      const payload = JSON.stringify({ token: tokenData.access_token, provider: "github" });
      const message = `authorization:github:success:${payload}`;
      const html = `<!doctype html><html><body><script>
        (function () {
          var message = ${JSON.stringify(message)};
          function receiveMessage(e) {
            window.opener.postMessage(message, e.origin);
            window.removeEventListener('message', receiveMessage, false);
          }
          window.addEventListener('message', receiveMessage, false);
          window.opener.postMessage('authorizing:github', '*');
        })();
      </script>Login successful — you can close this window.</body></html>`;

      return new Response(html, { headers: { "Content-Type": "text/html" } });
    }

    return new Response("AK Realtors CMS OAuth provider. Endpoints: /auth, /callback", { status: 200 });
  },
};
