"""Screenshot the entry game mid-run.

The game's requestAnimationFrame loop never idles, so Chrome's virtual clock is
exhausted before the page has finished loading and --screenshot captures a blank
document. The fix is to let a fixed number of frames run and then stub rAF, at
which point virtual time settles and the capture lands.
"""
import os, shutil, subprocess, http.server, socketserver, threading, functools, socket, time, sys

OUT = os.path.expanduser(r"~\joesp123-cyber.github.io\out")
QA = os.path.expanduser(r"~\joesp123-cyber.github.io\out-shot")
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
HERE = os.path.dirname(os.path.abspath(__file__))  # tools/ inside the repo
PORT = 8199

DRIVER = """<script>
try{localStorage.setItem('jw-intro','seen');localStorage.removeItem('jw-entered')}catch(e){}
(function(){
  var raf = window.requestAnimationFrame.bind(window), n = 0, started = false;
  var FRAMES = %d, EVERY = %d;
  window.requestAnimationFrame = function (cb) {
    n++;
    if (!started) { started = true;
      window.dispatchEvent(new KeyboardEvent('keydown',{code:'Space',key:' ',bubbles:true})); }
    else if (n %% EVERY === 0) {
      window.dispatchEvent(new KeyboardEvent('keydown',{code:'Space',key:' ',bubbles:true}));
    }
    if (n > FRAMES) { window.requestAnimationFrame = function(){ return 0; }; return 0; }
    return raf(cb);
  };
})();
</script>"""


def main():
    frames = int(sys.argv[1]) if len(sys.argv) > 1 else 150
    every = int(sys.argv[2]) if len(sys.argv) > 2 else 22
    if os.path.exists(QA):
        shutil.rmtree(QA)
    shutil.copytree(OUT, QA)
    p = os.path.join(QA, "index.html")
    html = open(p, encoding="utf8").read()
    open(p, "w", encoding="utf8").write(
        html.replace("</head>", (DRIVER % (frames, every)) + "</head>"))

    class H(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass

    class T(socketserver.ThreadingMixIn, http.server.HTTPServer):
        daemon_threads = True
        allow_reuse_address = True

    srv = T(("127.0.0.1", PORT), functools.partial(H, directory=QA))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    for _ in range(60):
        try:
            with socket.create_connection(("127.0.0.1", PORT), timeout=0.2):
                break
        except OSError:
            time.sleep(0.05)

    for name, w, h in [("game-desktop.png", 1440, 900), ("game-mobile.png", 500, 900)]:
        out = os.path.join(HERE, name)
        subprocess.run(
            [CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run",
             "--user-data-dir=" + os.path.join(QA, "_prof_" + name),
             f"--window-size={w},{h}", "--screenshot=" + out,
             "--virtual-time-budget=12000", f"http://127.0.0.1:{PORT}/"],
            capture_output=True, timeout=90)
        print(name, os.path.getsize(out) // 1024, "KB")
    srv.shutdown()


if __name__ == "__main__":
    main()
