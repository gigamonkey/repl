const input = document.getElementById("input");
const repl = document.getElementById("repl");
const cursor = document.getElementById("cursor");
const prompt = document.getElementById("prompt");
const minibuffer = document.getElementById("minibuffer");

const replConsole = {
  log: (text) => outputLine(text),
  info: (text) => outputLine(`INFO: ${text}`),
  warn: (text) => outputLine(`WARN: ${text}`),
  error: (text) => outputLine(`ERROR: ${text}`),
  debug: (text) => outputLine(`DEBUG: ${text}`),
};

/*
 * Put the prompt and the cursor at the end of the repl, ready for more input.
 * (They are removed from their parent in replEnter.)
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
  div.classList.add("value");
  div.innerText = JSON.stringify(text);
  repl.append(div);
  newPrompt();
};

const message = (text) => (minibuffer.innerText = text);

const replError = (text) => {
  const div = document.createElement("div");
  div.classList.add("error");
  div.innerText = text;
  repl.append(div);
  newPrompt();
};

/*
 * Show errors from evaluating code.
 */
const showError = (msg, source, line, column, error) => {
  // This seems to be a Chrome bug. Doesn't always happen but probably safe to
  // filter this message.
  // https://stackoverflow.com/questions/72396527/evalerror-possible-side-effect-in-debug-evaluate-in-google-chrome
  if (error === "EvalError: Possible side-effect in debug-evaluate") {
    return;
  }

  const errormsg = source !== "code" ? error : `${error} (line ${line - 3}, column ${column})`;
  if (iframe.contentWindow.repl.loading) {
    message(errormsg);
  } else {
    replError(errormsg);
  }
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
  const text = input.innerText;
  if (iframe !== null) {
    iframe.parentNode.removeChild(iframe);
  }
  iframe = newIframe();
  evaluate(
    [
      '"use strict";',
      "repl.loading = true;",
      "repl.message('Loading ...');",
      text,
      "repl.message('Loading ... ok.');",
      "//# sourceURL=code",
    ].join("\n")
  );
};

const keyBindings = {
  e: {
    guard: (e) => e.metaKey,
    preventDefault: true,
    fn: loadCode,
  },
};

const checkKeyBindings = (e) => {
  const binding = keyBindings[e.key];
  if (binding && binding.guard(e)) {
    if (binding.preventDefault) e.preventDefault();
    binding.fn();
  }
};

const replEnter = (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const text = cursor.innerText;
    const parent = cursor.parentNode;
    const p = prompt.cloneNode(true);
    p.removeAttribute("id");
    parent.replaceChild(p, prompt);
    parent.insertBefore(document.createTextNode(text), cursor);
    cursor.replaceChildren();
    parent.removeChild(cursor);
    evaluate(
      ['"use strict";', "repl.loading = false;", "repl.outputLine(", text, ")", "//# sourceURL=repl"].join("\n")
    );
  }
};

let iframe = newIframe();
window.onkeydown = checkKeyBindings;
submit.onclick = loadCode;
repl.onfocus = (e) => cursor.focus();
cursor.onkeydown = replEnter;
cursor.focus();
loadCode();
