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

const span = (clazz, html) => {
  const s = document.createElement("span");
  s.classList.add(clazz);
  if (html !== undefined) s.innerHTML = html;
  return s;
};

class Repl {
  constructor(div) {
    this.div = div;
    this.cursor = span("cursor", "&nbsp;");
    this.keybindings = new Keybindings();

    this.keybindings.bind({
      Backspace: this.backspace,
      Enter: this.enter,
      ArrowLeft: this.left,
      ArrowRight: this.right,
      "Control-a": this.bol,
      "Control-e": this.eol,
    });

    this.keybindings.bindDefault(this.selfInsert);

    this.div.onkeydown = (e) => {
      // Extract the bits we care about.
      const { key, ctrlKey, metaKey, altKey } = e;
      const x = { key, ctrlKey, metaKey, altKey };
      const b = this.keybindings.getBinding(x);

      if (b) {
        b.call(this, x);
        e.stopPropagation();
        e.preventDefault();
      }
    };

    this.div.onpaste = (e) => {
      const data = e.clipboardData.getData("text/plain");
      for (let c of data) {
        const x = { key: c, ctrlKey: false, metaKey: false, altKey: false };
        const b = getBinding(x);
        if (b) {
          b.call(this, x);
        }
      }
    };
  }

  start() {
    this.divAndPrompt();
    this.div.focus();
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

  ////////////////////////////////////////////////////////////////////////////////
  // Commands

  selfInsert(x) {
    this.cursor.parentElement.insertBefore(document.createTextNode(x.key), this.cursor);
  }

  backspace(x) {
    const last = this.cursor.previousSibling;
    if (last.nodeType === 3) {
      // TEXT_NODE
      if (last.length === 1) {
        last.parentElement.removeChild(last);
      } else {
        last.deleteData(last.length - 1, 1);
      }
    }
  }

  enter(x) {
    this.cursor.parentElement.removeChild(this.cursor);
    this.divAndPrompt();
  }

  left(x) {
    const e = this.cursor.previousSibling;
    if (e.nodeType === 3) {
      if (e.length === 1) {
        e.parentElement.insertBefore(this.cursor, e);
      }
    }
  }

  right(x) {
    const e = this.cursor.nextSibling;
    if (e.nodeType === 3) {
      if (e.length === 1) {
        e.parentElement.insertBefore(this.cursor, e.nextSibling);
      }
    }
  }

  bol(x) {
    const bol = this.cursor.parentElement.querySelector(".bol");
    this.cursor.parentElement.insertBefore(this.cursor, bol.nextSibling);
  }

  eol(x) {
    const eol = this.cursor.parentElement.querySelector(".eol");
    this.cursor.parentElement.insertBefore(this.cursor, eol);
  }
}

////////////////////////////////////////////////////////////////////////////////
// Bindings

class Keybindings {
  static descriptor(x) {
    let keys = [];
    // Note: Alt and Meta are likely different on different OSes.
    // If we actually use bindings for either of those may need to
    // provide an option to flip their meaning.
    if (x.ctrlKey) keys.push("Control");
    if (x.altKey) keys.push("Alt");
    if (x.metaKey) keys.push("Meta");
    if (keys.indexOf(x.key) === -1) keys.push(x.key);
    return keys.join("-");
  }

  bind(bindings) {
    this.bindings = bindings;
  }

  bindDefault(defaultBinding) {
    this.defaultBinding = defaultBinding;
  }

  getBinding(e) {
    const descriptor = Keybindings.descriptor(e);
    if (descriptor in this.bindings) {
      console.log(`${descriptor} is bound`);
      return this.bindings[descriptor];
    } else if (descriptor.length === 1) {
      console.log(`Using default binding for ${descriptor}`);
      return this.defaultBinding;
    } else {
      console.log(`No binding for ${descriptor}`);
      return false;
    }
  }
}

new Repl(document.getElementById("repl")).start();
