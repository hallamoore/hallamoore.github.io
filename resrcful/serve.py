import http.server
import re
import socketserver
import urllib.parse
from pathlib import Path

HOST = ("0.0.0.0", 8000)
FILE_EXT_REGEX = re.compile(".png|.jpg|.jpeg|.js|.css|.ico|.gif|.svg", re.IGNORECASE)


class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # self.path includes query params, url_parts.path doesn't.
        url_parts = urllib.parse.urlparse(self.path)
        path = Path(url_parts.path.strip("/"))
        print(self.path, path, path.is_file(), FILE_EXT_REGEX.match(path.suffix))

        if not path.is_file() and not FILE_EXT_REGEX.match(path.suffix):
            self.path = "index.html"

        return http.server.SimpleHTTPRequestHandler.do_GET(self)


if __name__ == "__main__":
    httpd = socketserver.TCPServer(HOST, Handler)
    httpd.serve_forever()
