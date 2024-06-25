import * as net from "net";
import fs from "fs";
import * as zlib from "zlib";

const getAcceptEncoding = (request: string) => {
  const encodings = request.split("Accept-Encoding: ")[1];
  if (encodings) {
    return encodings.split("\r\n")[0].split(", ");
  }
};

const buildResponseHeaders = (headers?: string[], compress?: boolean) => {
  if (compress) {
    headers?.push("Content-Encoding: gzip");
  }
  if (!headers) return "\r\n";
  return headers.join("\r\n") + "\r\n\r\n";
};

const OK = "HTTP/1.1 200 OK";
const CREATED = "HTTP/1.1 201 Created";
const NOT_FOUND = "HTTP/1.1 404 Not Found";

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const request = data.toString();
    console.log(request);
    const path = request.split(" ")[1];
    console.log(path.split("/")[1]);
    const params = path.split("/")[1];
    let response: string;
    const acceptEncodings = getAcceptEncoding(request);
    let compress = false;
    if (acceptEncodings?.find((v) => v === "gzip")) {
      compress = true;
    }

    function changeResponse(
      status: string,
      headers?: string[],
      body?: string | Buffer
    ): void {
      const response = `${status}\r\n${buildResponseHeaders(
        headers,
        compress
      )}`;
      socket.write(response);
      if (body) socket.write(body);
      socket.end();
    }
    switch (params) {
      case "": {
        changeResponse(OK);
        break;
      }
      case "echo": {
        const message = path.split("/")[2];
        if (compress) {
          const buffer = Buffer.from(message, "utf8");
          const zipped = zlib.gzipSync(buffer);
          changeResponse(
            OK,
            ["Content-Type: text/plain", `Content-Length: ${zipped.length}`],
            zipped
          );
          break;
        }
        changeResponse(
          OK,
          ["Content-Type: text/plain", `Content-Length: ${message.length}`],
          message
        );
        break;
      }
      case "user-agent": {
        const userAgent = request.split("User-Agent: ")[1].split("\r\n")[0];
        changeResponse(
          OK,
          ["Content-Type: text/plain", `Content-Length: ${userAgent.length}`],
          userAgent
        );
        break;
      }
      case "files": {
        const [_, __, fileName] = path.split("/");
        const args = process.argv.slice(2);
        const [___, absPath] = args;
        const filePath = absPath + "/" + fileName;
        if (request.startsWith("POST")) {
          const lines = request.split("\r\n");
          const requestBody = lines[lines.length - 1];
          fs.writeFileSync(filePath, requestBody);
          changeResponse(CREATED);
          break;
        }
        if (fs.existsSync(filePath)) {
          const contents = fs.readFileSync(filePath);
          changeResponse(
            OK,
            [
              "Content-Type: application/octet-stream",
              `Content-Length: ${contents.length}`,
            ],
            `${contents}`
          );
          break;
        } else {
          changeResponse(NOT_FOUND);
          break;
        }
      }
      default: {
        changeResponse(NOT_FOUND);
        break;
      }
    }
    socket.end();
  });
});

server.listen(4221, "localhost");
