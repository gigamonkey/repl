window.frames[0].window.outputLine = (text) => {
  const div = document.createElement("div");
  div.innerText = text;
  document.getElementById("output").append(div);
};

window.frames[0].window.onerror = (message, source, line, column, error) => {
  const div = document.createElement("div");
  div.classList.add("error");
  div.innerText = error;
  document.getElementById("output").append(div);
  return false;
};

// Send code to the iframe to be added as a script tag. The script tag can wrap
// the code in calls to outputLine to send output back to our #output div.
const evaluate = (code) => {
  const d = window.frames[0].document;
  const s = d.createElement("script");
  console.log("script code: " + code);
  s.innerText = code;
  d.documentElement.append(s);
};

document.getElementById("input").onkeypress = (e) => {
  if (e.key === "Enter") {
    const text = e.target.value;
    console.log(text);
    outputLine("> " + text);
    if (text.startsWith("let") || text.startsWith("const") || text.startsWith("var")) {
      evaluate(`${text}; outputLine(void 0)`);
    } else {
      evaluate(`outputLine(${text})`);
    }
  }
};
