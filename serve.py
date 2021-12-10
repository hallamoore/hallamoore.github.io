import socketserver
from http.server import SimpleHTTPRequestHandler


class MyHandler(SimpleHTTPRequestHandler):
    # def __init__(self, *args, **kwargs):
    #     super().__init__(*args, directory='../', **kwargs)

    def send_error(self, code, message=None):
        if code == 404:
            with open('404.html') as f:
                self.error_message_format = f.read()
        SimpleHTTPRequestHandler.send_error(self, code, message)


if __name__ == '__main__':
    PORT = 8001
    with socketserver.TCPServer(("", PORT), MyHandler) as httpd:
        print("serving at port", PORT)
        httpd.serve_forever()
