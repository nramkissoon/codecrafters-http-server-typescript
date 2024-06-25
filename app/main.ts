import * as net from "net";

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const request = data.toString();
    console.log(request);
    const path = request.split(" ")[1];
    console.log(path.split("/")[1]);
    const params = path.split("/")[1];
    let response: string;
    function changeResponse(response: string): void {
      socket.write(response);
      socket.end();
    }
    switch (params) {
      case "": {
        response = "HTTP/1.1 200 OK\r\n\r\n";
        changeResponse(response);
        break;
      }
      case "echo": {
        const message = path.split("/")[2];
        response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${message.length}\r\n\r\n${message}`;
        changeResponse(response);
        break;
      }
      case "user-agent": {
        const userAgent = request.split("User-Agent: ")[1].split("\r\n")[0];
        response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`;
        changeResponse(response);
        break;
      }
      default: {
        response = "HTTP/1.1 404 Not Found\r\n\r\n";
        changeResponse(response);
        break;
      }
    }
    socket.end();
  });
});

server.listen(4221, "localhost");
