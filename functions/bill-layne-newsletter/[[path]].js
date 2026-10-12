// Hand-written (not from tools/legacy-redirects.json): unrendered newsletter
// placeholders such as /bill-layne-newsletter/{{CTA_URL}} reach the site from
// old emails. Braces cannot be a Pages Functions file name, so this catch-all
// sends any placeholder-looking path to the newsletter page and lets every
// other request under /bill-layne-newsletter/ fall through to the static files.
export async function onRequest(context) {
  const url = new URL(context.request.url);
  let path = url.pathname;
  try { path = decodeURIComponent(path); } catch (e) { /* keep raw */ }
  if (/\{\{[^}]*\}\}/.test(path)) {
    return Response.redirect(url.origin + '/bill-layne-newsletter/', 301);
  }
  return context.next();
}
