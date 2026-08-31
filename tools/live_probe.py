"""Probe the LIVE site, not a local build.

Proxies https://joesp123-cyber.github.io through a local origin so a probe script
can be injected into the real deployed HTML and report back over http. This is
the only way to test the live assets: the page cannot be instrumented directly,
and its rAF loop makes Chrome's --dump-dom return an empty document.

Usage: python live_probe.py [reduced]
  reduced  emulate prefers-reduced-motion: reduce
"""
import http.server, socketserver, threading, functools, socket, subprocess, sys, time
import urllib.request, urllib.parse, os

ORIGIN = "https://joesp123-cyber.github.io"
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
HERE = os.path.dirname(os.path.abspath(__file__))  # tools/ inside the repo
PORT = 8205
REPORT = {}

PROBE = """<script>
window.addEventListener('load', function () {
  setTimeout(function () {
    var out = [];
    var gate = document.querySelector('[data-entry-gate]');
    var intro = document.querySelector('.intro-overlay');
    out.push('gate=' + (gate ? 'SHOWN' : 'ABSENT'));
    out.push('introInDom=' + (intro ? 'yes' : 'no'));
    out.push('reducedMotion=' + window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    try { out.push('entered=' + localStorage.getItem('jw-entered')); }
    catch (e) { out.push('entered=<blocked>'); }
    out.push('bodyOverflow=' + getComputedStyle(document.body).overflow);
    out.push('skipButton=' + (/Skip and go straight in/.test(document.body.textContent) ? 'yes' : 'no'));
    var canvas = document.querySelector('[data-entry-gate] canvas');
    out.push('canvas=' + (canvas ? canvas.width + 'x' + canvas.height : 'none'));
    if (gate) {
      var cs = getComputedStyle(gate);
      out.push('z=' + cs.zIndex + ' pos=' + cs.position + ' bg=' + cs.backgroundColor);
      var r = gate.getBoundingClientRect();
      out.push('rect=' + Math.round(r.width) + 'x' + Math.round(r.height));
    }
    fetch('/__report?r=' + encodeURIComponent(out.join(' | ')));
  }, 4500);
});
</script>"""


class Proxy(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith("/__report"):
            q = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            REPORT["r"] = q.get("r", [""])[0]
            self.send_response(204)
            self.end_headers()
            return
        url = ORIGIN + self.path
        try:
            with urllib.request.urlopen(url, timeout=20) as r:
                body = r.read()
                ctype = r.headers.get("Content-Type", "application/octet-stream")
        except Exception as e:
            self.send_error(502, str(e))
            return
        if "text/html" in ctype:
            body = body.replace(b"</head>", PROBE.encode() + b"</head>")
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *a):
        pass


class Threaded(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


def main():
    reduced = len(sys.argv) > 1 and sys.argv[1] == "reduced"
    httpd = Threaded(("127.0.0.1", PORT), Proxy)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    for _ in range(60):
        try:
            with socket.create_connection(("127.0.0.1", PORT), timeout=0.2):
                break
        except OSError:
            time.sleep(0.05)

    args = [CHROME, "--headless=new", "--disable-gpu", "--no-first-run",
            "--user-data-dir=" + os.path.join(HERE, "_probeprof"),
            "--window-size=1280,900"]
    if reduced:
        args.append("--force-prefers-reduced-motion")
    args.append(f"http://127.0.0.1:{PORT}/")

    proc = subprocess.Popen(args, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    deadline = time.time() + 30
    while time.time() < deadline and "r" not in REPORT:
        time.sleep(0.2)
    proc.terminate()
    try:
        proc.wait(timeout=5)
    except subprocess.TimeoutExpired:
        proc.kill()
    httpd.shutdown()

    label = "reduced-motion" if reduced else "default"
    print(f"[{label}] {REPORT.get('r', 'NO REPORT')}")


if __name__ == "__main__":
    main()
