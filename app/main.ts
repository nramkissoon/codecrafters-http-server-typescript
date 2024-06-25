import * as net from "net";
import fs from "fs";

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
      case "files": {
        const [_, __, fileName] = path.split("/");
        const args = process.argv.slice(2);
        const [___, absPath] = args;
        const filePath = absPath + "/" + fileName;
        if (fs.existsSync(filePath)) {
          const contents = fs.readFileSync(filePath);
          response = `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${contents.length}\r\n\r\n${contents}`;
          changeResponse(response);
          break;
        } else {
          changeResponse("HTTP/1.1 404 Not Found\r\n\r\n");
          break;
        }
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
