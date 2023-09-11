function initialize(projectRoot) {
  return {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      processId: 52515,
      clientInfo: {
        name: "Visual Studio Code - Insiders",
        version: "1.81.0-insider",
      },
      locale: "en",
      rootPath: projectRoot.replace("file://", ""),
      rootUri: projectRoot,
      capabilities: {
        positionEncoding: "utf-16",
        textDocumentSync: {
          openClose: true,
          change: 2,
          save: {},
        },
        textDocument: {
          rename: {
            prepareSupport: false,
          },
        },
      },
      initializationOptions: {},
      trace: "verbose",
      workspaceFolders: [
        {
          uri: projectRoot,
          name: "test-language-client",
        },
      ],
    },
  };
}

module.exports = initialize;
