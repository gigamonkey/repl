// NOTES:

// 1. The Shift and Alt key (at least) are both modifiers but also change the
// value of `key` in the Keyboard Event. Therefore some syntactically correct
// bindings such as Alt-d are impossible because the Alt turns the d into ∂.
// Similarly a binding like Shift-a would never happen because only Shift-A can
// occur. (Probably for Shift at least we should just not include it in
// bindings.)

// TODO:

// - History on up and down arrow.
// - Brace flashing.
// - Shift movement for selection.
// - Token colorizing.

const descriptor = (x) => {
  let keys = [];
  // Note: Alt and Meta are likely different on different OSes.
  // If we actually use bindings for either of those may need to
  // provide an option to flip their meaning.
  if (x.ctrlKey) keys.push("Control");
  if (x.altKey) keys.push("Alt");
  if (x.metaKey) keys.push("Meta");
  if (keys.indexOf(x.key) === -1) keys.push(x.key);
  return keys.join("-");
};

class Repl {
  constructor(div, keybindings) {
    this.div = div;
    this.keybindings = keybindings;
    this.cursor = span("cursor", "&nbsp;");

    this.div.onkeydown = (e) => {
      // Extract the bits we care about.
      const { key, ctrlKey, metaKey, altKey } = e;
      const x = { key, ctrlKey, metaKey, altKey };
      const b = this.keybindings.getBinding(descriptor(x));

      if (b) {
        b(repl, x);
        e.stopPropagation();
        e.preventDefault();
      }
    };

    this.div.onpaste = (e) => {
      const data = e.clipboardData.getData("text/plain");
      for (let c of data) {
        const x = { key: c, ctrlKey: false, metaKey: false, altKey: false };
        const b = getBinding(descriptor(x));
        if (b) {
          b(repl, x);
        }
      }
    };
  }

  /*
   * Make the div containing a prompt and the cursor.
   */
  divAndPrompt() {
    const div = document.createElement("div");
    div.append(span("prompt", "»"));
    div.append(span("bol"));
    //div.append(span("token")); // FIXME: actually use this.
    div.append(this.cursor);
    div.append(span("eol"));
    this.div.append(div);
  }
}

////////////////////////////////////////////////////////////////////////////////
// Commands

const selfInsert = (repl, x) => {
  repl.cursor.parentElement.insertBefore(document.createTextNode(x.key), repl.cursor);
};

const backspace = (repl, x) => {
  //const last = repl.childNodes[repl.childNodes.length - 1];

  const last = repl.cursor.previousSibling;
  if (last.nodeType === 3) {
    // TEXT_NODE
    if (last.length === 1) {
      last.parentElement.removeChild(last);
    } else {
      last.deleteData(last.length - 1, 1);
    }
  }
};

const enter = (repl, x) => {
  repl.cursor.parentElement.removeChild(repl.cursor);
  repl.divAndPrompt();
};

const left = (repl, x) => {
  const e = repl.cursor.previousSibling;
  if (e.nodeType === 3) {
    if (e.length === 1) {
      e.parentElement.insertBefore(repl.cursor, e);
    }
  }
};

const right = (repl, x) => {
  const e = repl.cursor.nextSibling;
  if (e.nodeType === 3) {
    if (e.length === 1) {
      e.parentElement.insertBefore(repl.cursor, e.nextSibling);
    }
  }
};

const bol = (repl, x) => {
  const bol = repl.cursor.parentElement.querySelector(".bol");
  repl.cursor.parentElement.insertBefore(repl.cursor, bol.nextSibling);
};

const eol = (repl, x) => {
  const eol = repl.cursor.parentElement.querySelector(".eol");
  repl.cursor.parentElement.insertBefore(repl.cursor, eol);
};

////////////////////////////////////////////////////////////////////////////////
// Bindings

class Keybindings {
  constructor(bindings) {
    this.bindings = bindings;
  }

  getBinding(descriptor) {
    console.log(descriptor);
    if (descriptor in this.bindings) {
      console.log("Found binding");
      return this.bindings[descriptor];
    } else if (descriptor.length === 1) {
      console.log("Default binding");
      return selfInsert;
    } else {
      console.log(`No binding for ${descriptor}`);
      return false;
    }
  }
}

const keybindings = new Keybindings({
  Backspace: backspace,
  Enter: enter,
  ArrowLeft: left,
  ArrowRight: right,
  "Control-a": bol,
  "Control-e": eol,
});

////////////////////////////////////////////////////////////////////////////////
// Main DOM manipulation

const span = (clazz, html) => {
  const s = document.createElement("span");
  s.classList.add(clazz);
  if (html !== undefined) s.innerHTML = html;
  return s;
};

const repl = new Repl(document.getElementById("repl"), keybindings);

repl.divAndPrompt();

repl.div.focus();
