const repl = document.getElementById("repl");

// NOTES:

// 1. The Shift and Alt key (at least) are both modifiers but also change the
// value of `key` in the Keyboard Event. Therefore some syntactically correct
// bindings such as Alt-d are impossible because the Alt turns the d into ∂.
// Similarly a binding like Shift-a would never happen because only Shift-A can
// occur. (Probably for Shift at least we should just not include it in
// bindings.)
//

const descriptor = (x) => {
  console.log(JSON.stringify(x));
  let keys = [];
  //if (x.shiftKey) keys.push("Shift");
  if (x.ctrlKey) keys.push("Control");
  if (x.altKey) keys.push("Alt");
  if (x.metaKey) keys.push("Meta");
  if (keys.indexOf(x.key) === -1) keys.push(x.key);
  return keys.join("-");
}

const selfInsert = (repl, x) => {
  repl.appendChild(document.createTextNode(x.key));
};

const backspace = (repl, x) => {
  const last = repl.childNodes[repl.childNodes.length - 1];
  if (last.nodeType === 3) {
    // TEXT_NODE
    if (last.length === 1) {
      repl.removeChild(last);
    } else {
      last.deleteData(last.length - 1, 1);
    }
  }
};

const keybindings = {
  Backspace: backspace,
};

const getBinding = (descriptor) => {
  console.log(descriptor);
  if (descriptor in keybindings) {
    console.log("Found binding");
    return keybindings[descriptor];
  } else if (descriptor.length === 1) {
    console.log("Default binding");
    return selfInsert;
  } else {
    console.log("No binding.");
  }
};

const divAndPrompt = (repl) => {
  const div = document.createElement("div");
  const prompt = document.createElement("span");
  prompt.innerText = "»";
  //prompt.innerText = ">>";
  prompt.classList.add("prompt");

  const token = document.createElement("span");
  token.classList.add("token");

  const cursor = document.createElement("span");
  cursor.classList.add("cursor");
  cursor.innerHTML = "&nbsp;"

  div.append(prompt);
  div.append(token);
  div.append(cursor);
  repl.append(div);
};


repl.onkeydown = (e) => {
  console.log(e);
  // Extract the bits we care about.
  const { key, ctrlKey, shiftKey, metaKey, altKey } = e;
  const x = { key, ctrlKey, shiftKey, metaKey, altKey };

  const b = getBinding(descriptor(x));

  if (b !== undefined) {
    b(repl, x);
  }
  e.stopPropagation();
  e.preventDefault();
};

divAndPrompt(repl);
repl.focus();
