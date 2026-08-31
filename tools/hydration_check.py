"""Load a running Next app under forced reduced motion and report React errors.

Proxies the app through a local origin so an error-recording probe can be
injected into the real server-rendered HTML. React's hydration failure (#418 /
#423 / #425) is reported through window.onerror, so catching that is a direct
test of whether the server markup and the first client render agree.

Usage: python hydration_check.py <target-origin> [path ...]
"""
import http.server, socketserver, threading, functools, socket, subprocess, sys, time
import urllib.request, urllib.parse, os

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
HERE = os.path.dirname(os.path.abspath(__file__))  # tools/ inside the repo
PORT = 8211
ORIGIN = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:3010"
PATHS = sys.argv[2:] or ["/"]
REPORTS: dict[str, str] = {}

PROBE = """<script>
window.__errs = [];
window.addEventListener('error', function (e) { window.__errs.push(String(e.message)); });
window.addEventListener('unhandledrejection', function (e) {
  window.__errs.push('rejection: ' + String(e.reason && e.reason.message || e.reason)); });
var _err = console.error;
console.error = function () {
  window.__errs.push('console.error: ' + Array.prototype.join.call(arguments, ' ').slice(0, 200));
  return _err.apply(console, arguments);
};
window.addEventListener('load', function () {
  setTimeout(function () {
    fetch('/__report?p=' + encodeURIComponent(location.pathname) +
          '&r=' + encodeURIComponent(window.__errs.length ? window.__errs.join(' ;; ') : 'CLEAN'));
  }, 3000);
});
</script>"""


class Proxy(http.server.BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def do_GET(self):
        if self.path.startswith("/__report"):
            q = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            REPORTS[q.get("p", ["?"])[0]] = q.get("r", [""])[0]
            self.send_response(204)
            self.send_header("Content-Length", "0")
            self.end_headers()
            return
        try:
            with urllib.request.urlopen(ORIGIN + self.path, timeout=25) as r:
                body, ctype = r.read(), r.headers.get("Content-Type", "text/plain")
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
    httpd = Threaded(("127.0.0.1", PORT), Proxy)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    for _ in range(60):
        try:
            with socket.create_connection(("127.0.0.1", PORT), timeout=0.2):
                break
        except OSError:
            time.sleep(0.05)

    failed = False
    for path in PATHS:
        prof = os.path.join(HERE, "_hyd", path.strip("/").replace("/", "_") or "root")
        proc = subprocess.Popen(
            [CHROME, "--headless=new", "--disable-gpu", "--no-first-run",
             "--force-prefers-reduced-motion", "--user-data-dir=" + prof,
             "--window-size=1280,900", f"http://127.0.0.1:{PORT}{path}"],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        deadline = time.time() + 30
        while time.time() < deadline and path not in REPORTS:
            time.sleep(0.2)
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            proc.kill()
        result = REPORTS.get(path, "NO REPORT")
        ok = result == "CLEAN"
        failed = failed or not ok
        print(("PASS " if ok else "FAIL ") + f"{path}  {'' if ok else result[:220]}")
    httpd.shutdown()
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
