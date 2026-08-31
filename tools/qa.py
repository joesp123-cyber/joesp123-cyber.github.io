"""Screenshot harness for the static export.

Headless Chrome's virtual clock never drives framer-motion's IntersectionObserver
callbacks, so every [data-reveal] element stays at opacity 0 in a --screenshot
run. This builds a QA copy of out/ with the reveals pinned visible and the
entrance overlay suppressed, then shoots it in vertical slices (Chrome captures
one viewport, so the slice offset is applied as a negative margin on <html>).
Nothing here ships.
"""
import os, re, shutil, subprocess, sys, http.server, socketserver, threading, functools

OUT = os.path.expanduser(r"~\joesp123-cyber.github.io\out")
QA = os.path.expanduser(r"~\joesp123-cyber.github.io\out-qa")
SHOT = os.path.dirname(os.path.abspath(__file__))
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
PORT = 8123

OVERRIDE = """
<style id="qa">
  [data-reveal]{opacity:1 !important; transform:none !important;}
  .intro-overlay{display:none !important;}
  /* framer-motion's height/opacity animation never completes under Chrome's
     virtual clock either, so pin the opened accordion panel too */
  #work .overflow-hidden{opacity:1 !important; height:auto !important;}
</style>
<script>sessionStorage.setItem('jw-intro','seen');/* the entry game runs an endless rAF loop that eats Chrome's virtual clock, so screenshots of the page itself have to come in past it */try{localStorage.setItem('jw-entered','1')}catch(e){}</script>
"""


def build_qa(open_row=None, offset=0):
    if os.path.exists(QA):
        shutil.rmtree(QA)
    shutil.copytree(OUT, QA)
    p = os.path.join(QA, "index.html")
    html = open(p, encoding="utf8").read()
    extra = OVERRIDE
    if offset:
        extra += f"<style>html{{margin-top:-{offset}px}}</style>"
    if open_row is not None:
        extra += (
            "<script>window.addEventListener('load',function(){setTimeout(function(){"
            f"var b=document.querySelectorAll('#work button[aria-controls]')[{open_row}];"
            "if(b)b.click();},400)});</script>"
        )
    html = html.replace("</head>", extra + "</head>")
    open(p, "w", encoding="utf8").write(html)


def serve():
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=QA)
    socketserver.TCPServer.allow_reuse_address = True
    httpd = socketserver.TCPServer(("127.0.0.1", PORT), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


def shot(name, w=1440, h=1000, budget=9000):
    out = os.path.join(SHOT, name)
    subprocess.run(
        [CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars",
         f"--virtual-time-budget={budget}", f"--window-size={w},{h}",
         f"--screenshot={out}", f"http://127.0.0.1:{PORT}/"],
        capture_output=True)
    print(name, os.path.getsize(out) // 1024, "KB")


if __name__ == "__main__":
    job = sys.argv[1] if len(sys.argv) > 1 else "slices"
    if job == "slices":
        for i, off in enumerate([0, 900, 1900, 2900]):
            build_qa(offset=off)
            httpd = serve()
            shot(f"q{i}.png")
            httpd.shutdown()
    elif job == "open":
        build_qa(open_row=0, offset=int(sys.argv[2]) if len(sys.argv) > 2 else 2600)
        httpd = serve()
        shot("q-open.png", h=1200)
        httpd.shutdown()
    elif job == "mobile":
        build_qa(offset=int(sys.argv[2]) if len(sys.argv) > 2 else 0)
        httpd = serve()
        shot("q-mob.png", w=500, h=1400)
        httpd.shutdown()
    elif job == "gate":
        # solved state, so the revealed link is in the shot
        extra = "<script>try{localStorage.setItem('jw-repo-unlocked','1')}catch(e){}</script>"
        build_qa(offset=int(sys.argv[2]) if len(sys.argv) > 2 else 0)
        p2 = os.path.join(QA, "index.html")
        h = open(p2, encoding="utf8").read()
        if len(sys.argv) > 3 and sys.argv[3] == "solved":
            h = h.replace("<head>", "<head>" + extra, 1)
        open(p2, "w", encoding="utf8").write(h)
        httpd = serve()
        shot("q-gate.png", w=int(sys.argv[4]) if len(sys.argv)>4 else 1440, h=1000)
        httpd.shutdown()
    elif job == "tail":
        for i, off in enumerate([int(x) for x in sys.argv[2:]]):
            build_qa(offset=off)
            httpd = serve()
            shot(f"t{i}.png")
            httpd.shutdown()
