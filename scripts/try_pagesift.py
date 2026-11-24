"""Reply to a "[try] <url>" issue with pagesift's Markdown for that URL.

Runs inside .github/workflows/try-pagesift.yml. Everything a visitor typed is read from the
event file and passed around as data (argv lists, files), never through a shell.
Set DRY_RUN=1 to print the reply instead of posting it (for local testing).
"""

from __future__ import annotations

import datetime as dt
import json
import os
import re
import subprocess
import sys
import tempfile
import time
import urllib.parse

MAX_CHARS = 6_000
DAILY_TRIES = 3
SCRAPE_TIMEOUT_S = 75
REPO = os.environ.get("GITHUB_REPOSITORY", "YOLOW92/YOLOW92")
FOOTER = (f"\n\n<sub>Automated reply from this profile's GitHub Action · "
          f"[how it works](https://github.com/{REPO}/blob/main/scripts/try_pagesift.py)</sub>")

URL_RE = re.compile(r"https?://[^\s<>\"'`]+", re.IGNORECASE)

FRIENDLY = {
    "SsrfBlocked": "That address is not public, so pagesift refused to fetch it.",
    "RobotsDisallowed": "The site's robots.txt asks crawlers not to fetch that page, so pagesift skipped it.",
    "Timeout": "The page took too long to load.",
    "TooLarge": "The page is larger than this demo accepts.",
    "AccessBarrier": "The site put up a bot check or login wall.",
    "DnsFailure": "The host name does not resolve.",
    "InvalidRequest": "That does not look like a URL pagesift can fetch.",
}

CHILD = r"""
import json, sys, time
import pagesift
url = sys.argv[1]
t = time.perf_counter()
try:
    doc = pagesift.scrape(url)
    out = {"ok": True, "markdown": doc.markdown or "", "status": doc.status_code,
           "final_url": doc.final_url, "engine": doc.engine}
except pagesift.PagesiftError as e:
    out = {"ok": False, "kind": type(e).__name__, "message": str(e)[:300]}
out["seconds"] = round(time.perf_counter() - t, 2)
print(json.dumps(out))
"""


def gh(*args: str, stdin: str | None = None) -> str:
    return subprocess.run(["gh", *args], input=stdin, capture_output=True, text=True, check=True).stdout


def pick_url(body: str) -> str | None:
    m = URL_RE.search(body or "")
    if not m:
        return None
    url = m.group(0).rstrip(".,;:!?)]}>")
    if len(url) > 2048:
        return None
    parts = urllib.parse.urlsplit(url)
    if parts.scheme not in ("http", "https") or not parts.hostname or "@" in parts.netloc:
        return None
    return url


def tries_today(repo: str, login: str) -> int:
    cutoff = dt.datetime.now(dt.timezone.utc) - dt.timedelta(days=1)
    since = cutoff.strftime("%Y-%m-%dT%H:%M:%SZ")
    raw = gh("api", "-X", "GET", f"repos/{repo}/issues",
             "-f", f"creator={login}", "-f", "state=all", "-f", f"since={since}", "-f", "per_page=100")
    n = 0
    for it in json.loads(raw):
        created = dt.datetime.fromisoformat(it["created_at"].replace("Z", "+00:00"))
        if created >= cutoff and it.get("title", "").startswith("[try]") and "pull_request" not in it:
            n += 1
    return n


def fence(text: str) -> str:
    longest = max((len(m) for m in re.findall(r"`+", text)), default=0)
    return "`" * max(3, longest + 1)


def scrape(url: str) -> dict:
    try:
        proc = subprocess.run([sys.executable, "-I", "-c", CHILD, url],
                              capture_output=True, text=True, timeout=SCRAPE_TIMEOUT_S)
    except subprocess.TimeoutExpired:
        return {"ok": False, "kind": "Timeout", "message": "", "seconds": SCRAPE_TIMEOUT_S}
    try:
        return json.loads(proc.stdout.strip().splitlines()[-1])
    except (IndexError, json.JSONDecodeError):
        return {"ok": False, "kind": "InternalError", "message": (proc.stderr or "")[-300:], "seconds": 0}


def compose(url: str, res: dict) -> str:
    if not res.get("ok"):
        why = FRIENDLY.get(res.get("kind", ""), "pagesift could not parse that page.")
        return f"❌ {why}\n\n`{res.get('kind', 'Error')}` after {res.get('seconds', 0)} s." + FOOTER
    md = res.get("markdown", "")
    shown = md[:MAX_CHARS]
    more = f" (showing the first {MAX_CHARS:,})" if len(md) > MAX_CHARS else ""
    f = fence(shown)
    head = (f"✅ Parsed by **pagesift** in **{res['seconds']} s** with the `{res.get('engine') or 'auto'}` engine "
            f"→ {len(md):,} characters of Markdown{more}.")
    body = f"{head}\n\n<details open><summary>Markdown</summary>\n\n{f}markdown\n{shown}\n{f}\n\n</details>"
    if not md.strip():
        body = f"{head}\n\nThe page came back with no main content."
    return body + FOOTER


def main() -> int:
    event = json.load(open(os.environ["GITHUB_EVENT_PATH"], encoding="utf-8"))
    issue = event["issue"]
    repo = os.environ.get("GITHUB_REPOSITORY", "")
    number = str(issue["number"])
    login = issue["user"]["login"]
    dry = os.environ.get("DRY_RUN") == "1"

    url = pick_url(issue.get("body") or "")
    if url is None:
        reply = "❌ I could not find an `http(s)` URL in the issue. Open a new one with the URL in the form." + FOOTER
    elif not dry and login != os.environ.get("OWNER") and tries_today(repo, login) > DAILY_TRIES:
        reply = f"⏳ That is more than {DAILY_TRIES} tries in 24 hours for this account; please come back tomorrow." + FOOTER
    else:
        reply = compose(url, scrape(url))

    if dry:
        print(reply)
        return 0
    with tempfile.NamedTemporaryFile("w", suffix=".md", delete=False, encoding="utf-8") as fh:
        fh.write(reply)
    gh("issue", "comment", number, "--repo", repo, "--body-file", fh.name)
    gh("issue", "close", number, "--repo", repo, "--reason", "completed")
    gh("issue", "lock", number, "--repo", repo, "--reason", "resolved")
    return 0


if __name__ == "__main__":
    sys.exit(main())
