import type { TemplateContext } from './types';

/**
 * {{DOMAIN_DOCS_LOAD}} — load the project's domain glossary (CONTEXT.md) and
 * recorded decisions (ADRs) before reviewing a plan / PRD / ADR.
 *
 * These artifacts are produced by the mattpocock engineering skills
 * (`/grill-with-docs`, `/improve-codebase-architecture`):
 *   - CONTEXT.md  — committed glossary at the repo root, or per-context files
 *                   when a CONTEXT-MAP.md exists at the root (multi-context repos).
 *   - ADRs        — uncommitted decision records under the per-repo AI workspace
 *                   at $GSTACK_WORKSPACE_DIR/docs/adr (and per-context
 *                   .../src/<context>/docs/adr).
 *
 * gstack's own GSTACK_WORKSPACE_DIR (from bin/gstack-slug) resolves to
 * ~/.ai-workspace/<repo> — the same place those skills write ADRs — so the two
 * skill sets share one workspace without any extra configuration. Reading these
 * first means the review speaks the project's language and respects decisions
 * already made instead of re-litigating them.
 *
 * Shared by /autoplan (Phase 0, feeds every phase) and the four plan-review
 * skills (so a direct invocation is domain-aware too). Emitted as an H3 so it
 * nests cleanly under each skill's H2 pre-review audit / Phase 0.
 */
export function generateDomainDocsLoad(ctx: TemplateContext): string {
  const bin = ctx.paths.binDir;
  return `### Domain Context + Decision Records (CONTEXT.md, ADRs)

If this project keeps a domain glossary or decision records, read them before
reviewing — they are the project's own language and its settled decisions.
\`CONTEXT.md\` is a committed glossary at the repo root (or per-context files when
a \`CONTEXT-MAP.md\` exists at the root); ADRs are uncommitted, under the per-repo
AI workspace. Both are written by \`/grill-with-docs\` and
\`/improve-codebase-architecture\`.

Discover what exists:

\`\`\`bash
eval "$(${bin}/gstack-slug 2>/dev/null)" 2>/dev/null || true
_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
echo "── CONTEXT (committed glossary) ──"
ls "$_ROOT"/CONTEXT.md "$_ROOT"/CONTEXT-MAP.md 2>/dev/null || true
find "$_ROOT" -name CONTEXT.md -not -path '*/node_modules/*' -not -path '*/.git/*' 2>/dev/null | head -20
echo "── ADRs (AI workspace: \${GSTACK_WORKSPACE_DIR:-~/.ai-workspace/<repo>}) ──"
{ [ -n "$GSTACK_WORKSPACE_DIR" ] && [ -d "$GSTACK_WORKSPACE_DIR" ] && find "$GSTACK_WORKSPACE_DIR" -path '*/docs/adr/*.md' 2>/dev/null | sort | head -60; } || echo "no ADR workspace yet"
\`\`\`

Then **read what you found** with the Read tool and use it:

- **Every \`CONTEXT.md\`** is the canonical glossary — the project's own meaning
  for each domain term. Use those exact terms in your review. If the plan uses a
  term in a way that conflicts with the glossary, flag it ("the plan says *X* but
  CONTEXT.md defines *X* as *Y* — which is meant?").
- **Relevant ADRs** are decisions already made, with rationale. Do NOT
  re-litigate a settled decision. If the plan contradicts an ADR, surface it
  explicitly by ADR number — either the plan is wrong, or the ADR needs a
  superseding entry. Cite the ADR number on any finding that touches one.
- If a \`CONTEXT-MAP.md\` exists, the repo has **multiple contexts**: read the
  per-context \`CONTEXT.md\` the map points to, plus the matching per-context ADR
  directory, for whichever context this plan touches.
- **When the artifact under review IS a PRD or an ADR** (the common
  "review this PRD/ADR" invocation), the surrounding CONTEXT.md and sibling ADRs
  are the ground truth — read all of them before forming an opinion.

If no \`CONTEXT.md\` or ADRs exist, say so in one line ("no CONTEXT.md / ADRs
found — proceeding without domain docs") and continue. Never block on their
absence, and never create them here — authoring them is the job of
\`/grill-with-docs\`.`;
}
