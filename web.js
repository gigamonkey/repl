const input = document.getElementById("input");
const output = document.getElementById("output");
const cursor = document.getElementById("cursor");
const prompt = document.getElementById("prompt");

const newPrompt = () => {
  const div = document.createElement("div");
  div.append(prompt);
  div.append(cursor);
  output.append(div);
  cursor.focus();
};

/*
 * Output a line in the output div.
 */
const outputLine = (text) => {
  const div = document.createElement("div");
  div.innerText = "" + text;
  output.append(div);
  newPrompt();
};

/*
 * Show errors from evaluating code.
 */
const showError = (message, source, line, column, error) => {
  const div = document.createElement("div");
  div.classList.add("error");
  div.innerText = "Error: " + error;
  output.append(div);
  newPrompt();
  return true;
};

/*
 * Send code to the iframe to be added as a script tag. The script tag can wrap
 * the code in calls to outputLine to send output back to our #output div.
 */
const evaluate = (code) => {
  try {
    const d = window.frames[0].document;
    const s = d.createElement("script");
    s.append(document.createTextNode(code));
    d.documentElement.append(s);
  } catch (e) {}
};

submit.onclick = (e) => {
  const text = input.value;
  evaluate(`${text}; outputLine('ok.');`);
  return false;
};

cursor.onkeypress = (e) => {
  if (e.key === "Enter") {
    const text = cursor.innerText;
    const parent = cursor.parentNode;
    const p = prompt.cloneNode(true);
    p.removeAttribute("id");
    parent.replaceChild(p, prompt);
    parent.insertBefore(document.createTextNode(text), cursor);
    cursor.replaceChildren();
    parent.removeChild(cursor);
    evaluate(`outputLine(${text})`);
    return false;
  }
};

window.frames[0].window.outputLine = outputLine;
window.frames[0].window.onerror = showError;
cursor.onerror = showError;

output.onfocus = (e) => {
  console.log("here");
  cursor.focus();
};

cursor.focus();
