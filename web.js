const input = document.getElementById("input");
const repl = document.getElementById("repl");
const cursor = document.getElementById("cursor");
const prompt = document.getElementById("prompt");

const replConsole = {
  log: (text) => outputLine(text),
  info: (text) => outputLine(`INFO: ${text}`),
  warn: (text) => outputLine(`WARN: ${text}`),
  error: (text) => outputLine(`ERROR: ${text}`),
  debug: (text) => outputLine(`DEBUG: ${text}`),
};

/*
 * Put the prompt and the cursor at the end of the repl, ready for more input.
 */
const newPrompt = () => {
  const div = document.createElement("div");
  div.append(prompt);
  div.append(cursor);
  repl.append(div);
  cursor.focus();
};

/*
 * Output a line in the repl div.
 */
const outputLine = (text) => {
  const div = document.createElement("div");
  div.innerText = "" + text;
  repl.append(div);
  newPrompt();
};

/*
 * Emit a message to the repl other than printing a value. These messages are
 * formatted differently and inserted before the current prompt.
 */
const message = (text) => {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerText = "" + text;
  repl.insertBefore(div, prompt.parentNode);
};

/*
 * Show errors from evaluating code.
 */
const showError = (message, source, line, column, error) => {
  const div = document.createElement("div");
  div.classList.add("error");
  div.innerText = `${error} (line ${line - 2}, column ${column})`;
  repl.append(div);
  newPrompt();
  return true;
};

/*
 * Create a new iframe to use for evaluating code.
 */
const newIframe = () => {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("src", "about:blank");
  document.querySelector("body").append(iframe);
  iframe.contentWindow.repl = { outputLine, message };
  iframe.contentWindow.onerror = showError;
  iframe.contentWindow.console = replConsole;
  return iframe;
};

/*
 * Send code to the current iframe to be added as a script tag and thus
 * evaluated. The code can use the function in the iframe's repl object (see
 * newIframe) to communicate back.
 */
const evaluate = (code) => {
  const d = window.frames[0].document;
  const s = d.createElement("script");
  s.append(document.createTextNode(code));
  d.documentElement.append(s);
};

/*
 * Load the code from input into the iframe, creating a new iframe if needed.
 */
const loadCode = () => {
  const text = input.value;
  if (iframe !== null) {
    iframe.parentNode.removeChild(iframe);
  }
  iframe = newIframe();
  evaluate(['"use strict";', "repl.message('Loading ...');", text, "repl.message('... loaded.');"].join("\n"));
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
    evaluate(['"use strict";', "repl.outputLine(", text, ")"].join("\n"));
    return false;
  } else {
    return true;
  }
};

let iframe = newIframe();
submit.onclick = loadCode;
cursor.onerror = showError;
repl.onfocus = (e) => cursor.focus();
cursor.focus();

const logKey = (label, e) => {
  console.log(`${label} - ${e.key}/${e.keyCode}`);
  console.log(e);
};

window.onkeydown = (e) => {
  // Steal this one.
  if (e.key === "e" && e.metaKey) {
    e.preventDefault();
    loadCode();
  }
};

/*
window.onkeypress = (e) => {
  e.preventDefault();
  e.stopPropagation();
  logKey("press", e);
  return true;
}

window.onkeyup = (e) => {
  e.preventDefault();
  e.stopPropagation();
  logKey("up", e);
  return true;
}
*/
