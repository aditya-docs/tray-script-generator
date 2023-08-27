import axios from "axios";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
dotenv.config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.post("/snippet", async (req, res) => {
  const { input, context, inputTypes } = req.body;
  if (input && context && inputTypes) {
    try {
      const result = await generateScriptSnippet(input, context, inputTypes);
      return res.send(result);
    } catch (error) {
      return res.status(500).send(error.message);
    }
  }
  return res.sendStatus(400);
});

app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});

async function generateScriptSnippet(input, context, inputTypes) {
  const dataTypesContext = Object.keys(input).reduce(
    (acc, field, index) => acc + `${field}: ${inputTypes[index]}\n`,
    ""
  );
  const body = {
    model: "text-davinci-003",
    prompt: `Using the context and input below give me a javascript function called jsFunction that takes 'input' as argument. \n input: ${JSON.stringify(
      input
    )} Context: ${context} \nHere are the data types for all keys of the input object to the function: \n${dataTypesContext}`,
    max_tokens: 2200,
    temperature: 0,
  };
  const response = await axios.post(
    "https://api.openai.com/v1/completions",
    body,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SECRET_TOKEN}`,
      },
    }
  );

  const scriptObj = {
    stepData: {
      "script-1": {
        type: "SetStepData",
        name: "script-1",
        metadata: {
          __typename: "ConnectorSnippetDataMetadata",
          connector: {
            __typename: "ConnectorSnippetDataMetadataConnector",
            name: "script",
            description: "Add JavaScript to the workflow",
            version: "3.3",
          },
          matched_operation: null,
          operation: "execute",
          title: "Transform JSON",
        },
        properties: {
          variables: {
            type: "array",
            value: Object.keys(input).map((key) => {
              return {
                type: "object",
                value: {
                  name: { type: "string", value: key },
                  value: {},
                },
              };
            }),
          },
          script: {
            type: "string",
            value: `// You can reference the input variables using input.NAME\n// Parsed JSON files could be referenced as fileInput\nexports.step = function(input, fileInput) { ${response.data.choices[0].text}; return jsFunction(input)};`,
          },
          file_output: { type: "boolean", value: false },
        },
        errors: [],
        hasAuthenticationError: false,
      },
    },
    structure: [{ name: "script-1", type: "normal", content: {} }],
    version: "1.0.0",
  };

  return {
    snippet: scriptObj,
    jsfunction: response.data.choices[0].text,
  };
}
