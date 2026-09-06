#!/usr/bin/env bash
# PreToolUse hook (Bash matcher). Before a `git commit` runs, scans the
# currently staged diff for added comment lines that narrate a change
# ("used to", "moved from", "no longer", etc.) rather than describing the
# code as it stands, and blocks the commit if it finds one.
#
# Enforces this repo's own CLAUDE.md: "No comments that document
# abandoned approaches" - a comment should explain the code that's
# actually there, never an alternative that was tried and replaced.
set -uo pipefail

cmd="$(jq -r '.tool_input.command // empty' 2>/dev/null)"

# No-op for every bash call that isn't (or doesn't include) a git commit -
# this hook fires on every Bash invocation, so bail out fast otherwise.
case "$cmd" in
  *"git commit"*) ;;
  *) exit 0 ;;
esac

repo_root="$(git rev-parse --show-toplevel 2>/dev/null || true)"
[ -n "$repo_root" ] && cd "$repo_root"

pattern='used to|no longer|previously|moved (from|here|to)|was moved|now that|instead of the old|the old version|this replaces|before this change|used to be'

file=""
relevant=0
offenders=()

while IFS= read -r line; do
  case "$line" in
    "+++ b/"*)
      file="${line#+++ b/}"
      case "$file" in
        *.ts | *.tsx | *.js | *.jsx | *.css) relevant=1 ;;
        *) relevant=0 ;;
      esac
      ;;
    "+++ /dev/null")
      relevant=0
      ;;
    "+++"*) ;;
    "+"*)
      if [ "$relevant" -eq 1 ]; then
        content="${line#+}"
        if printf '%s' "$content" | grep -Eiq "$pattern"; then
          offenders+=("$file: $line")
        fi
      fi
      ;;
  esac
done < <(git diff --cached -U0)

if [ "${#offenders[@]}" -gt 0 ]; then
  list="$(printf '%s\n' "${offenders[@]}")"
  reason="Comment(s) in this diff read like they narrate a change (\"used to\", \"moved from\", \"no longer\", etc.) rather than describing the code as it stands:

${list}

CLAUDE.md: \"No comments that document abandoned approaches\" - a comment should explain the code as it is, not the diff that produced it. Rewrite the comment(s) above, then re-stage and commit."
  jq -n --arg reason "$reason" \
    '{hookSpecificOutput: {hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: $reason}}'
  exit 1
fi

exit 0
