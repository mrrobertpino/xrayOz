# xrayOz 🩻

**See. Spot. Source** A browser-only companion to HTMeatbaL for investigating HTML, CSS, and JavaScript.

## Open it

Open `index.html` in modern Chrome or Edge. Keep `app.css`, `app.js`, and `logo.jfif` beside it. No install, build step, account, backend, API key, CDN, or internet connection is required for local use.

Use **Upload My HTML** for an `.html` export (up to 2 MB), or **Use Sample Website**. The example menu switches between:

- **A · Basic HTML:** Meatball fan page with headings, paragraphs, bold, italic, underline, a picture, a link, and a list. No CSS or JavaScript.
- **B · Interactive website:** the same content with styling, a text-changing button, a color-changing button, and a treat counter.

Each panel scrolls independently. On desktop, the Preview width slider redistributes the four panels. Smaller screens stack panels. Dark mode is the default; the Light mode / Dark mode button toggles the interface theme.

## Investigate

- Click a rendered element to select its complete HTML source range, including nested content and its closing tag. Click code to select and scroll to the corresponding rendered element. Keyboard users can focus source elements and press Enter or Space.
- Click a CSS rule to outline all matching elements. Select an element to see directly matching rules, inline declarations, inherited candidates, and actual computed values. Explanations describe common properties in everyday language. CSS rules are normalized by the browser; expand **Original embedded CSS** to read the unchanged source.
- In example B, click a button to run its interaction and highlight its registered handler. Click a connected function in the JavaScript panel to select its button without running the action. Known demonstration interactions have specific explanations; uploaded code gets factual event-handler descriptions.
- **Clear selection** removes highlights. **Restart** reloads the current document and resets its interaction state. Switching **Run JavaScript** also restarts the preview.

Uploaded JavaScript is paused by default. Its source is still displayed. Turn on **Run JavaScript** to run inline scripts in the sandbox and discover their direct event-handler connections. Original files are never edited or saved over, and are not retained after refresh.

## Publish on GitHub Pages

1. Create a repository for xrayOz, or choose an existing website repository.
2. Put `index.html`, `app.css`, `app.js`, `logo.jfif`, and `.nojekyll` in its root. Alternatively put all five in `/docs`.
3. In the repository's **Settings → Pages**, choose **Deploy from a branch**, select the branch (typically `main`), then select **/(root)** or **/docs**, matching step 2. Save.
4. When deployment finishes, open the URL displayed in Pages settings. Share that URL with students.

Update the same files and commit to the publishing branch to publish changes. Relative asset paths work under a repository subpath. There are no environment variables or build commands. You do not need to publish the test script or screenshots.

These steps follow [GitHub's publishing-source documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

This workspace also contains an unrelated Unity project. Publish only the xrayOz files, not the workspace root.

## Isolation and known limits

- The preview uses `sandbox="allow-scripts"` with an opaque origin; it cannot read the app's document or storage, navigate the top window, open popups, or submit forms. The app accepts messages only from its current preview window and document token, and escapes displayed source.
- A restrictive content security policy blocks external scripts, images, styles, fonts, frames, and fetch requests. Embedded data images work. Linked assets in exports appear missing unless embedded in the HTML; the upload status explains this. External stylesheet/script contents cannot be inspected because xrayOz does not fetch them.
- Links are inspectable and their normal navigation is prevented. Script execution is intended for classroom code, not malicious programs: an infinite loop can freeze a browser tab, and enabled scripts can replace or navigate their own frame. Restart the preview after unexpected changes; reload the tab if it becomes unresponsive. Browser sandboxing is not a CPU limit or a guarantee against all intentionally hostile code.
- Exact HTML offsets are retained for original elements. The browser repairs malformed HTML for rendering, so unusual invalid nesting or optional closing tags can have approximate source boundaries. Script-generated elements have no exact original source range and are identified as such.
- JavaScript mapping identifies directly registered `addEventListener` handlers, inline HTML handlers, and `onclick` functions when inspected. Reverse mapping covers handlers registered on original elements during initial load. Delegation, minification, asynchronous registration, framework handlers, and indirect targets are not generally attributable. The app reports uncertainty instead of inventing relationships.
- CSS shows matching declarations and actual computed values rather than claiming to fully explain the cascade. Inheritance is labeled as a candidate, not a proven winning declaration. Media and supports conditions are evaluated; advanced container queries, nesting, pseudo-elements, and dynamic stylesheet changes are not fully traced. CSS panel rule selection shows selector matches even if a surrounding condition is inactive, and labels inactive rules.

## Verification

`test.cjs` runs end-to-end checks with Playwright and installed Microsoft Edge. Set `XRAY_PLAYWRIGHT_PATH` to a Playwright package directory if it is not available through normal Node resolution; run `node test.cjs`. These are developer-only tools, not app dependencies.

Verified locally:

- Both examples and independent source panels.
- Forward/reverse HTML selection, full closing-tag highlighting, and nested bold selection.
- CSS matching in both directions, multiple matches, computed color changes.
- All three JavaScript interactions and function-to-button selection.
- Clear, restart through script toggling, inspectable links, and default-paused uploaded JavaScript.
- A real `pageSource()` export from the HTMeatbaL app in this workspace.
- Plain HTML, malformed HTML, parent-document isolation, and blocked network asset/fetch requests.
- Local-file loading, static hosting under `/classroom/xrayOz/`, and narrow-screen layout without horizontal page overflow.

Desktop and mobile screenshots are included for visual review. Live GitHub Pages deployment and physical school-managed Chromebook testing remain environment checks: no repository destination or Chromebook was provided. Before class, open the published URL on a managed Chromebook and load a student export.

## Companion files

The arrow beside Upload My HTML opens Upload My CSS and Upload My JavaScript. These local files are added to the current preview without changing the original HTML source. Each type replaces its previous companion file. CSS is applied after embedded styles; JavaScript is added after the HTML and starts paused. Enable Run JavaScript to execute it. Restart preserves companion files; loading new HTML or a sample clears them.

