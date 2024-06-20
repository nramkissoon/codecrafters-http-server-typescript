import * as net from "net";

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const request = data.toString();
    const path = request.split(" ")[1];
    if (path.startsWith("/echo/")) {
      const echo = path.split("/")[2];
      const len = echo.length;
      const response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${len}\r\n\r\n${echo}`;
      socket.write(response);
      socket.end();
      return;
    }
    const response =
      path === "/"
        ? "HTTP/1.1 200 OK\r\n\r\n"
        : "HTTP/1.1 404 Not Found\r\n\r\n";
    socket.write(response);
    socket.end();
  });
});

server.listen(4221, "localhost");
