"""Exercise the entry game in a real browser, against the real built output.

Three independent page loads, because the states are mutually exclusive:
  phase=first   a visitor who has never been here
  phase=skip    someone who takes the skip route
  phase=return  someone who has already been through

Why this does not use --virtual-time-budget like the other harnesses: the game
runs an unbroken requestAnimationFrame loop, which burns the whole virtual clock
before the network has even answered, and Chrome then dumps an empty document.
So the page runs in real time and POSTs its results back to this server, and the
server is threaded because a single-threaded one deadlocks on Chrome's parallel
connections.

What this cannot do is win the game — the model is not reachable from the page,
and blind space presses lose by design. Winnability is proved by
lib/flappy.test.mjs; this proves the plumbing around it.
"""
import os, shutil, subprocess, http.server, socketserver, threading, functools
import socket, time, sys, urllib.parse

OUT = os.path.expanduser(r"~\joesp123-cyber.github.io\out")
QA = os.path.expanduser(r"~\joesp123-cyber.github.io\out-qa")
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
PORT = 8188

REPORTS: dict[str, str] = {}

DRIVER = r"""
<script>
(function () {
  var phase = (location.search.match(/phase=(\w+)/) || [])[1] || 'first';
  var out = [];
  function check(n, c) { out.push((c ? "PASS " : "FAIL ") + n); }
  function done() {
    fetch('/__report?phase=' + phase + '&r=' + encodeURIComponent(out.join(' | ')));
  }
  function gate() { return document.querySelector('[data-entry-gate]'); }
  function locked() { return getComputedStyle(document.body).overflow === 'hidden'; }
  function statusText() {
    var el = document.querySelector('[data-entry-gate] [aria-live]');
    return el ? el.textContent : '';
  }
  function space() {
    window.dispatchEvent(new KeyboardEvent('keydown',
      { code: 'Space', key: ' ', bubbles: true, cancelable: true }));
  }

  try { localStorage.setItem('jw-intro', 'seen'); } catch (e) {}
  if (phase === 'return') { try { sessionStorage.setItem('jw-entered', '1'); } catch (e) {} }
  else { try { sessionStorage.removeItem('jw-entered'); } catch (e) {} }

  window.addEventListener('error', function (e) {
    fetch('/__report?phase=' + phase + '&r=' + encodeURIComponent('FAIL page error: ' + e.message));
  });

  window.addEventListener('load', function () {
    setTimeout(function () {
      try {
        if (phase === 'first') {
          check('door is up on a first visit', !!gate());
          check('page scroll is locked behind it', locked());
          check('canvas is present', !!(gate() && gate().querySelector('canvas')));
          check('starts idle, waiting for input', /Space to rise/.test(statusText()));
          check('score starts at zero', /^0\/5/.test(statusText().trim()));
          check('site content is in the document for crawlers',
            /Systems that keep working/.test(document.body.textContent));
          check('a skip route is offered',
            /Skip and go straight in/.test(document.body.textContent));

          space();
          setTimeout(function () {
            check('space bar starts the run', !/Space to rise/.test(statusText()));
            // blind input loses, by design — so this also proves the loop advances
            setTimeout(function () {
              check('an unplayed run ends rather than hanging',
                /Down\./.test(statusText()));
              space();
              setTimeout(function () {
                check('space restarts after a loss', /Space to rise/.test(statusText()));
                check('door is still up after losing', !!gate());
                done();
              }, 300);
            }, 4000);
          }, 500);
          return;
        }

        if (phase === 'skip') {
          var btn = Array.prototype.find.call(
            document.querySelectorAll('button'),
            function (b) { return /Skip and go straight in/.test(b.textContent); });
          check('skip control is reachable', !!btn);
          if (btn) btn.click();
          setTimeout(function () {
            check('skip opens the door', !gate());
            check('skip releases the scroll', !locked());
            var saved = null;
            try { saved = sessionStorage.getItem('jw-entered'); } catch (e) {}
            check('skip is remembered', saved === '1');
            done();
          }, 1600);
          return;
        }

        if (phase === 'replay') {
          var skipBtn = Array.prototype.find.call(
            document.querySelectorAll('button'),
            function (b) { return /Skip and go straight in/.test(b.textContent); });
          skipBtn.click();
          setTimeout(function () {
            check('door is down after skipping', !gate());
            var replay = Array.prototype.find.call(
              document.querySelectorAll('button'),
              function (b) { return /Play the door game/.test(b.textContent); });
            check('footer offers a replay', !!replay);
            if (replay) replay.click();
            setTimeout(function () {
              check('replay puts the door back up', !!gate());
              check('replay resets the run to the start', /Space to rise/.test(statusText()));
              check('replay clears the remembered pass', !sessionStorage.getItem('jw-entered'));
              done();
            }, 600);
          }, 1400);
          return;
        }

        if (phase === 'reduced') {
          check('reduced motion still gets the door', !!gate());
          check('reduced motion still gets the skip button',
            /Skip and go straight in/.test(document.body.textContent));
          check('nothing has moved before the first input',
            /Space to rise/.test(statusText()));
          done();
          return;
        }

        check('returning visitor is not asked again', !gate());
        check('scroll is free for them', !locked());
        check('site is reachable', /Systems that keep working/.test(document.body.textContent));
        done();
      } catch (e) {
        fetch('/__report?phase=' + phase + '&r=' + encodeURIComponent('FAIL threw: ' + e.message));
      }
    }, 700);
  });
})();
</script>
"""


class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith("/__report"):
            q = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            REPORTS.setdefault(q.get("phase", ["?"])[0], q.get("r", [""])[0])
            self.send_response(204)
            self.end_headers()
            return
        super().do_GET()

    def log_message(self, fmt, *args):
        if os.environ.get("TRACE"): print("  req:", args[0] if args else fmt)


class Threaded(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


def run(phase, timeout=25):
    args = [CHROME, "--headless=new", "--disable-gpu", "--no-first-run",
            "--user-data-dir=" + os.path.join(QA, f"_profile_{phase}"),
            "--window-size=1280,900"]
    if phase == "reduced":
        args.append("--force-prefers-reduced-motion")
    args.append(f"http://127.0.0.1:{PORT}/?phase={phase}")
    proc = subprocess.Popen(args, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    deadline = time.time() + timeout
    while time.time() < deadline and phase not in REPORTS:
        time.sleep(0.2)
    proc.terminate()
    try:
        proc.wait(timeout=5)
    except subprocess.TimeoutExpired:
        proc.kill()
    if phase not in REPORTS:
        return [f"FAIL [{phase}] no report came back within {timeout}s"]
    return [x.strip() for x in REPORTS[phase].split("|")]


def main():
    if os.path.exists(QA):
        shutil.rmtree(QA)
    shutil.copytree(OUT, QA)
    p = os.path.join(QA, "index.html")
    # read fully before opening for write: open(p,"w") truncates, and if the
    # read is nested inside the write call it reads back an empty file
    html = open(p, encoding="utf8").read()
    open(p, "w", encoding="utf8").write(html.replace("</head>", DRIVER + "</head>"))

    handler = functools.partial(Handler, directory=QA)
    httpd = Threaded(("127.0.0.1", PORT), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    for _ in range(100):
        try:
            with socket.create_connection(("127.0.0.1", PORT), timeout=0.2):
                break
        except OSError:
            time.sleep(0.05)

    lines = []
    for phase in ("first", "skip", "return", "reduced", "replay"):
        lines += [f"[{phase}] {x}" for x in run(phase)]
    httpd.shutdown()

    for line in lines:
        print(line)
    failed = [x for x in lines if "PASS " not in x]
    print(f"\n{len(lines) - len(failed)}/{len(lines)} passed")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
