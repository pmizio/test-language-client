const fs = require("node:fs");
const path = require("node:path");
const readline = require("node:readline/promises");
const { stdin: input, stdout: output } = require("node:process");
const proc = require("node:child_process");

const initialize = require("./initialize");

const rl = readline.createInterface({ input, output });

const subprocess = proc.spawn("rust-analyzer", [], {
  stdio: ["pipe", "pipe", "pipe"],
});

subprocess.stderr.on("data", (data) => {
  console.log(data.toString());
});

subprocess.stdout.on("data", (data) => {
  const msg = data.toString();
  console.log(msg);
  const [, , json] = msg.split("\r\n");
  if (!json) {
    return;
  }

  const message = JSON.parse(json);
  if (message?.result?.documentChanges) {
    message.result.documentChanges.forEach((it) => {
      const filePath = new URL(it.textDocument.uri).pathname;
      const fileContent = fs.readFileSync(filePath).toString();
      console.log(`${path.basename(filePath)} before edits:`);
      console.log(fileContent);

      const lines = fileContent.split("\n");

      it.edits.forEach((edit) => {
        const { start, end } = edit.range;
        const line = lines[start.line];
        lines[start.line] =
          line.slice(0, start.character) +
          edit.newText +
          line.slice(end.character);
      });

      console.log("\nFile after edits:");
      console.log(lines.join("\n"));
    });
  }
});

async function sendRequest(requestObj, wait = true) {
  const request = JSON.stringify(requestObj);

  console.log(`Content-Length: ${request.length}\n`);
  console.log(request);

  subprocess.stdin.write(
    Buffer.from(`Content-Length: ${request.length}\r\n\r\n`)
  );
  subprocess.stdin.write(Buffer.from(request));

  if (wait) {
    return rl.question("");
  }
}

function getProjectUri() {
  return `file://${__dirname}`;
}

async function main() {
  await sendRequest(initialize(getProjectUri()));

  await sendRequest(
    {
      jsonrpc: "2.0",
      method: "initialized",
      params: {},
    },
    false
  );

  await sendRequest({
    jsonrpc: "2.0",
    method: "textDocument/didOpen",
    params: {
      textDocument: {
        uri: `${getProjectUri()}/src/main.rs`,
        languageId: "rust",
        version: 1,
        text: 'mod test_module;\nuse test_module::test_fn;\n\nfn main() {\n    let test = "world";\n\n    println!("Hello, {}!", test);\n    test_fn();\n}\n',
      },
    },
  });

  await sendRequest({
    jsonrpc: "2.0",
    id: 2,
    method: "textDocument/rename",
    params: {
      textDocument: {
        uri: `${getProjectUri()}/src/main.rs`,
      },
      position: {
        line: 4,
        character: 9,
      },
      newName: "todo",
    },
  });

  await sendRequest({
    jsonrpc: "2.0",
    id: 3,
    method: "textDocument/rename",
    params: {
      textDocument: {
        uri: `${getProjectUri()}/src/main.rs`,
      },
      position: {
        line: 7,
        character: 8,
      },
      newName: "todo_fn",
    },
  });

  subprocess.kill();
  process.exit();
}

main();
