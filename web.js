const input = document.getElementById("input");
const repl = document.getElementById("repl");
const cursor = document.getElementById("cursor");
const prompt = document.getElementById("prompt");

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
 * Show errors from evaluating code.
 */
const showError = (message, source, line, column, error) => {
  const div = document.createElement("div");
  div.classList.add("error");
  div.innerText = "Error: " + error;
  repl.append(div);
  newPrompt();
  return true;
};

/*
 * Send code to the iframe to be added as a script tag. The script tag can wrap
 * the code in calls to outputLine to send output back to our #repl div.
 */
const evaluate = (code) => {
  const d = window.frames[0].document;
  const s = d.createElement("script");
  s.append(document.createTextNode(code));
  d.documentElement.append(s);
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
repl.onfocus = (e) => cursor.focus();
cursor.focus();
