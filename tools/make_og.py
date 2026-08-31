"""Render the Open Graph share card.

Built as HTML and screenshotted at 1200x630 rather than composed in PIL, so it
uses the real Manrope and the real tokens — a share card drawn with whatever
font happened to be installed would not be the same brand.
"""
import os, shutil, subprocess, http.server, socketserver, threading, functools, socket, time

REPO = os.path.expanduser(r"~\joesp123-cyber.github.io")
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
HERE = os.path.dirname(os.path.abspath(__file__))  # tools/ inside the repo
STAGE = os.path.join(HERE, "_og")
PORT = 8221

HTML = """<!doctype html>
<html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;500;600&display=swap" rel="stylesheet">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { width:1200px; height:630px; overflow:hidden; font-family:Manrope, sans-serif;
         background:#efefeb; position:relative; }
  .photo { position:absolute; inset:0; background:url('rhythm.jpg') center/cover; }
  .veil  { position:absolute; inset:0;
           background:linear-gradient(100deg, rgba(20,24,26,.92) 0%, rgba(20,24,26,.72) 52%, rgba(20,24,26,.34) 100%); }
  .in    { position:absolute; inset:0; padding:76px 84px; display:flex; flex-direction:column;
           justify-content:space-between; color:#efefeb; }
  .eyebrow { font-size:19px; font-weight:500; letter-spacing:.22em; text-transform:uppercase;
             color:rgba(239,239,235,.72); }
  h1 { font-size:78px; font-weight:600; line-height:1.02; letter-spacing:-.025em; max-width:15ch; }
  .rule { width:80px; height:3px; background:#4f9384; margin:34px 0 30px; }
  .foot { display:flex; justify-content:space-between; align-items:baseline; font-weight:300; }
  .foot .name { font-size:26px; letter-spacing:.16em; text-transform:uppercase; font-weight:500; }
  .foot .url  { font-size:20px; color:rgba(239,239,235,.62); }
</style></head>
<body>
  <div class="photo"></div><div class="veil"></div>
  <div class="in">
    <p class="eyebrow">AI Engineer &amp; Founder</p>
    <div>
      <h1>Systems that keep working after I have gone home.</h1>
      <div class="rule"></div>
      <div class="foot">
        <span class="name">Joe Wotherspoon</span>
        <span class="url">joesp123-cyber.github.io</span>
      </div>
    </div>
  </div>
</body></html>
"""


def main():
    if os.path.exists(STAGE):
        shutil.rmtree(STAGE)
    os.makedirs(STAGE)
    shutil.copy(os.path.join(REPO, "public", "images", "rhythm.jpg"),
                os.path.join(STAGE, "rhythm.jpg"))
    open(os.path.join(STAGE, "index.html"), "w", encoding="utf8").write(HTML)

    class H(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass

    class T(socketserver.ThreadingMixIn, http.server.HTTPServer):
        daemon_threads = True
        allow_reuse_address = True

    srv = T(("127.0.0.1", PORT), functools.partial(H, directory=STAGE))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    for _ in range(60):
        try:
            with socket.create_connection(("127.0.0.1", PORT), timeout=0.2):
                break
        except OSError:
            time.sleep(0.05)

    out = os.path.join(REPO, "app", "opengraph-image.png")
    subprocess.run(
        [CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run",
         "--user-data-dir=" + os.path.join(STAGE, "_prof"),
         "--window-size=1200,630", "--force-device-scale-factor=1",
         "--virtual-time-budget=9000", "--screenshot=" + out,
         f"http://127.0.0.1:{PORT}/"],
        capture_output=True, timeout=90)
    srv.shutdown()
    shutil.copy(out, os.path.join(HERE, "og-preview.png"))
    print("wrote", out, os.path.getsize(out) // 1024, "KB")


if __name__ == "__main__":
    main()
