# Widgets

Read README.md as the topic index, then only docs matching the change.
Widgets takes props and numbers: no Live, protocol, bridge, core or application imports. Use real TypeScript extensions for imports. Nothing loads from a CDN. Update the governing topic doc whenever functionality changes.

Run `npm ci`, `npm run typecheck`, `npm test`, and `npm run build`. Use Storybook (`npm run dev`) for gesture and visual changes; say which story was actually checked. A new widget gets a stories file beside it, with at least a default and a disabled story.

Every agent commit must end with a blank line and a GitHub-compatible co-author trailer naming the agent that actually made it, for example `Co-authored-by: Codex <noreply@openai.com>` or `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Never name an agent that didn't write the commit.
