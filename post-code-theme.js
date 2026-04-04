(function () {
  var KEYWORDS = {
    and: true,
    as: true,
    assert: true,
    async: true,
    await: true,
    break: true,
    class: true,
    continue: true,
    def: true,
    del: true,
    elif: true,
    else: true,
    except: true,
    False: true,
    finally: true,
    for: true,
    from: true,
    global: true,
    if: true,
    import: true,
    in: true,
    is: true,
    lambda: true,
    None: true,
    nonlocal: true,
    not: true,
    or: true,
    pass: true,
    raise: true,
    return: true,
    True: true,
    try: true,
    while: true,
    with: true,
    yield: true,
  };

  var BUILTINS = {
    dict: true,
    enumerate: true,
    Exception: true,
    float: true,
    int: true,
    len: true,
    list: true,
    map: true,
    max: true,
    min: true,
    print: true,
    range: true,
    set: true,
    sorted: true,
    str: true,
    sum: true,
    tuple: true,
    zip: true,
  };

  var KNOWN_NAMESPACES = {
    cv2: true,
    pd: true,
    px: true,
    go: true,
    st: true,
    time: true,
    json: true,
    queue: true,
    threading: true,
    psycopg2: true,
  };

  function escapeHtml(value) {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function isIdentifierStart(char) {
    return /[A-Za-z_]/.test(char);
  }

  function isIdentifierPart(char) {
    return /[A-Za-z0-9_]/.test(char);
  }

  function isDigit(char) {
    return /[0-9]/.test(char);
  }

  function getStringPrefix(source, index) {
    var prefixes = ["fr", "rf", "br", "rb", "tr", "rt", "f", "r", "b", "u"];
    var slice = source.slice(index, index + 3).toLowerCase();
    for (var i = 0; i < prefixes.length; i += 1) {
      var prefix = prefixes[i];
      if (slice.indexOf(prefix) === 0) {
        var nextChar = source.charAt(index + prefix.length);
        if (nextChar === '"' || nextChar === "'") {
          return prefix.length;
        }
      }
    }
    return 0;
  }

  function readString(source, index) {
    var prefixLength = getStringPrefix(source, index);
    var start = index;
    var quote = source.charAt(index + prefixLength);
    var triple =
      source.slice(index + prefixLength, index + prefixLength + 3) ===
      quote + quote + quote;
    var cursor = index + prefixLength + (triple ? 3 : 1);

    while (cursor < source.length) {
      if (!triple && source.charAt(cursor) === "\\") {
        cursor += 2;
        continue;
      }

      if (triple) {
        if (source.slice(cursor, cursor + 3) === quote + quote + quote) {
          cursor += 3;
          break;
        }
        cursor += 1;
        continue;
      }

      if (source.charAt(cursor) === quote) {
        cursor += 1;
        break;
      }

      cursor += 1;
    }

    return {
      value: source.slice(start, cursor),
      nextIndex: cursor,
      type: "string",
    };
  }

  function tokenize(source) {
    var tokens = [];
    var index = 0;

    while (index < source.length) {
      var char = source.charAt(index);

      if (char === "#") {
        var commentEnd = source.indexOf("\n", index);
        if (commentEnd === -1) {
          commentEnd = source.length;
        }
        tokens.push({
          type: "comment",
          value: source.slice(index, commentEnd),
        });
        index = commentEnd;
        continue;
      }

      if (char === '"' || char === "'" || getStringPrefix(source, index)) {
        var stringToken = readString(source, index);
        tokens.push(stringToken);
        index = stringToken.nextIndex;
        continue;
      }

      if (/\s/.test(char)) {
        var spaceEnd = index + 1;
        while (spaceEnd < source.length && /\s/.test(source.charAt(spaceEnd))) {
          spaceEnd += 1;
        }
        tokens.push({
          type: "space",
          value: source.slice(index, spaceEnd),
        });
        index = spaceEnd;
        continue;
      }

      if (char === "@") {
        var decoratorEnd = index + 1;
        while (
          decoratorEnd < source.length &&
          /[A-Za-z0-9_.]/.test(source.charAt(decoratorEnd))
        ) {
          decoratorEnd += 1;
        }
        tokens.push({
          type: "decorator",
          value: source.slice(index, decoratorEnd),
        });
        index = decoratorEnd;
        continue;
      }

      if (isDigit(char)) {
        var numberEnd = index + 1;
        while (
          numberEnd < source.length &&
          /[0-9._]/.test(source.charAt(numberEnd))
        ) {
          numberEnd += 1;
        }
        tokens.push({
          type: "number",
          value: source.slice(index, numberEnd),
        });
        index = numberEnd;
        continue;
      }

      if (isIdentifierStart(char)) {
        var nameEnd = index + 1;
        while (
          nameEnd < source.length &&
          isIdentifierPart(source.charAt(nameEnd))
        ) {
          nameEnd += 1;
        }
        tokens.push({
          type: "identifier",
          value: source.slice(index, nameEnd),
        });
        index = nameEnd;
        continue;
      }

      tokens.push({
        type: "operator",
        value: char,
      });
      index += 1;
    }

    return classifyTokens(tokens);
  }

  function previousSignificant(tokens, index) {
    for (var cursor = index - 1; cursor >= 0; cursor -= 1) {
      if (tokens[cursor].type !== "space") {
        return tokens[cursor];
      }
    }
    return null;
  }

  function nextSignificant(tokens, index) {
    for (var cursor = index + 1; cursor < tokens.length; cursor += 1) {
      if (tokens[cursor].type !== "space") {
        return tokens[cursor];
      }
    }
    return null;
  }

  function classifyTokens(tokens) {
    return tokens.map(function (token, index) {
      if (token.type !== "identifier") {
        return token;
      }

      var previousToken = previousSignificant(tokens, index);
      var nextToken = nextSignificant(tokens, index);

      if (KEYWORDS[token.value]) {
        return { type: "keyword", value: token.value };
      }

      if (previousToken && previousToken.value === "def") {
        return { type: "function", value: token.value };
      }

      if (previousToken && previousToken.value === "class") {
        return { type: "class-name", value: token.value };
      }

      if (/^[A-Z0-9_]+$/.test(token.value) && token.value.length > 1) {
        return { type: "constant", value: token.value };
      }

      if (BUILTINS[token.value] || KNOWN_NAMESPACES[token.value]) {
        return { type: "builtin", value: token.value };
      }

      if (nextToken && nextToken.value === "(") {
        return { type: "function", value: token.value };
      }

      return { type: "identifier", value: token.value };
    });
  }

  function renderTokens(tokens) {
    return tokens
      .map(function (token) {
        var value = escapeHtml(token.value);

        if (token.type === "space") {
          return value;
        }

        return '<span class="code-token token-' + token.type + '">' + value + "</span>";
      })
      .join("");
  }

  function ensureStyles() {
    if (document.getElementById("post-code-theme-styles")) {
      return;
    }

    var style = document.createElement("style");
    style.id = "post-code-theme-styles";
    style.textContent = [
      ".code-box{font-family:Consolas,'Courier New',monospace;tab-size:4;-moz-tab-size:4;white-space:pre-wrap;overflow:auto;--code-base:#d7ebff;--code-comment:#6fa8d8;--code-keyword:#49a6ff;--code-string:#a8d6ff;--code-number:#79c6ff;--code-function:#7fd7ff;--code-class:#9ed8ff;--code-builtin:#73b8ff;--code-constant:#b7deff;--code-decorator:#5eb8ff;--code-operator:#90b7dc;--code-identifier:#d7ebff;}",
      ".code-box .code-token{color:var(--code-base);}",
      ".code-box .token-comment{color:var(--code-comment);font-style:italic;}",
      ".code-box .token-keyword{color:var(--code-keyword);font-weight:600;}",
      ".code-box .token-string{color:var(--code-string);}",
      ".code-box .token-number{color:var(--code-number);}",
      ".code-box .token-function{color:var(--code-function);}",
      ".code-box .token-class-name{color:var(--code-class);font-weight:600;}",
      ".code-box .token-builtin{color:var(--code-builtin);}",
      ".code-box .token-constant{color:var(--code-constant);}",
      ".code-box .token-decorator{color:var(--code-decorator);}",
      ".code-box .token-operator{color:var(--code-operator);}",
      ".code-box .token-identifier{color:var(--code-identifier);}",
    ].join("");
    document.head.appendChild(style);
  }

  function applyTheme() {
    ensureStyles();

    var blocks = document.querySelectorAll("pre.code-box");
    blocks.forEach(function (block) {
      if (block.getAttribute("data-code-themed") === "true") {
        return;
      }

      var source = block.textContent || "";
      block.innerHTML = renderTokens(tokenize(source));
      block.setAttribute("data-code-themed", "true");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyTheme);
  } else {
    applyTheme();
  }
})();
