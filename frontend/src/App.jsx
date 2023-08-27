import { useState, useRef } from "react";
import { copyButtonIcon, copiedIcon, trayLogo } from "./icons.jsx";
import CodeEditor from "@uiw/react-textarea-code-editor";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import Link from "@mui/material/Link";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormHelperText from "@mui/material/FormHelperText";
import FormControl from "@mui/material/FormControl";
import axios from "axios";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [formFields, setFormFields] = useState([
    { variable: "", value: "", dataType: "" },
  ]);
  const snippetCopyButtonRef = useRef(null);
  const jsfunctionCopyButtonRef = useRef(null);
  const [chatResponse, setChatResponse] = useState({
    snippet: {},
    jsfunction: "",
  });
  const [context, setContext] = useState("");
  const dataTypes = ["array", "object", "string", "number", "boolean"];

  const handleFormChange = (event, index) => {
    let data = [...formFields];
    data[index][event.target.name] = event.target.value;
    setFormFields(data);
  };

  const submit = async (e) => {
    e.preventDefault();
    const input = {};
    const inputTypes = [];
    formFields.map((field) => {
      input[field.variable] = field.value;
      inputTypes.push(field.dataType);
    });
    console.log(inputTypes);
    const response = await axios.post(`${API_URL}/snippet`, {
      input,
      context,
      inputTypes,
    });
    setChatResponse(response.data);
  };

  const addFields = () => {
    let object = {
      variable: "",
      value: "",
    };
    setFormFields([...formFields, object]);
  };

  const removeFields = (index) => {
    let data = [...formFields];
    data.splice(index, 1);
    setFormFields(data);
  };

  return (
    <div className="App">
      <div
        style={{ display: "flex", justifyContent: "center" }}
        dangerouslySetInnerHTML={{ __html: trayLogo }}
      ></div>
      <h1>Script snippet generator</h1>
      <Alert severity="warning">
        The data you send will be processed by OpenAI, however it will NOT be
        used by OpenAI for training purposes. Read OpenAI's data usage policy{" "}
        <Link
          href="https://openai.com/policies/api-data-usage-policies"
          underline="hover"
        >
          here
        </Link>
      </Alert>
      <form onSubmit={submit} style={{ marginTop: "20px" }}>
        {formFields.map((form, index) => {
          return (
            <div
              key={index}
              style={{ display: "flex", gap: "20px", marginBottom: "10px" }}
            >
              <FormControl style={{ flexGrow: 1 }}>
                <TextField
                  id="outlined-multiline-flexible"
                  name="variable"
                  label="variable name"
                  multiline
                  maxRows={1}
                  onChange={(event) => handleFormChange(event, index)}
                  value={form.variable}
                  required
                  style={{ flexGrow: 1 }}
                />
                <FormHelperText>Required</FormHelperText>
              </FormControl>
              <FormControl style={{ flexGrow: 3 }}>
                <TextField
                  name="value"
                  label="variable value"
                  multiline
                  maxRows={4}
                  onChange={(event) => handleFormChange(event, index)}
                  value={form.value}
                  required
                />
                <FormHelperText>Required</FormHelperText>
              </FormControl>
              <FormControl required sx={{ minWidth: 130 }}>
                <InputLabel id="demo-simple-select-required-label">
                  Data Type
                </InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  name="dataType"
                  id="demo-simple-select"
                  value={form.dataType}
                  label="data type *"
                  onChange={(event) => handleFormChange(event, index)}
                  required
                >
                  {dataTypes.map((dataType) => (
                    <MenuItem value={dataType} key={dataType}>
                      {dataType}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Required</FormHelperText>
              </FormControl>
              <button
                type="button"
                onClick={() => removeFields(index)}
                style={{ height: 56 }}
              >
                Remove
              </button>
            </div>
          );
        })}
        <button type="button" onClick={addFields} className="buttonMargin">
          Add More..
        </button>
        <br />
        <div className="row">
          <h3>Describe what the function is supposed to do</h3>
          <textarea
            required
            className="context-box"
            onChange={(e) => setContext(e.target.value)}
          ></textarea>
        </div>
        <button type="submit" className="buttonMargin">
          Submit
        </button>
      </form>
      <div className="codeblocks-container row">
        <div className="codeblock">
          <button
            ref={jsfunctionCopyButtonRef}
            className="copy-button"
            dangerouslySetInnerHTML={{ __html: copyButtonIcon }}
            onClick={(e) => {
              navigator.clipboard.writeText(
                JSON.stringify(chatResponse.jsfunction, null, 2)
              );
              jsfunctionCopyButtonRef.current.innerHTML = copiedIcon;
              setTimeout(() => {
                jsfunctionCopyButtonRef.current.innerHTML = copyButtonIcon;
              }, 700);
            }}
            type="button"
          ></button>
          <h3>Javascript Code: </h3>
          <CodeEditor
            value={chatResponse.jsfunction}
            language="js"
            onChange={(e) =>
              setChatResponse({ ...chatResponse, jsfunction: e.target.value })
            }
            padding={15}
            style={{
              fontSize: 16,
              backgroundColor: "#f5f5f5",
              fontFamily:
                "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
            }}
          />
        </div>
        <div className="codeblock">
          <button
            ref={snippetCopyButtonRef}
            className="copy-button"
            dangerouslySetInnerHTML={{ __html: copyButtonIcon }}
            onClick={(e) => {
              navigator.clipboard.writeText(
                JSON.stringify(chatResponse.snippet, null, 2)
              );
              snippetCopyButtonRef.current.innerHTML = copiedIcon;
              setTimeout(() => {
                snippetCopyButtonRef.current.innerHTML = copyButtonIcon;
              }, 700);
            }}
            type="button"
          ></button>
          <h3>Builder snippet Code: </h3>
          <CodeEditor
            value={JSON.stringify(chatResponse.snippet, null, 2)}
            language="json"
            onChange={(e) =>
              setChatResponse({
                ...chatResponse,
                snippet: JSON.parse(e.target.value),
              })
            }
            padding={15}
            style={{
              fontSize: 16,
              backgroundColor: "#f5f5f5",
              fontFamily:
                "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
