document.addEventListener('DOMContentLoaded', function () {
  var codeBlocks = document.querySelectorAll('pre.code-box');

  if (!codeBlocks.length) {
    return;
  }

  codeBlocks.forEach(function (block) {
    if (block.parentElement && block.parentElement.classList.contains('code-copy-wrap')) {
      return;
    }

    var wrapper = document.createElement('div');
    wrapper.className = 'code-copy-wrap';
    block.parentNode.insertBefore(wrapper, block);
    wrapper.appendChild(block);

    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'code-copy-button';
    button.textContent = 'Copy';
    button.setAttribute('aria-label', 'Copy code block');
    wrapper.appendChild(button);

    button.addEventListener('click', function () {
      var codeText = block.textContent;
      var resetTimer;

      var markCopied = function () {
        button.textContent = 'Copied';
        button.classList.add('is-copied');
        window.clearTimeout(resetTimer);
        resetTimer = window.setTimeout(function () {
          button.textContent = 'Copy';
          button.classList.remove('is-copied');
        }, 1500);
      };

      var markFailed = function () {
        button.textContent = 'Failed';
        window.clearTimeout(resetTimer);
        resetTimer = window.setTimeout(function () {
          button.textContent = 'Copy';
        }, 1500);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(codeText).then(markCopied).catch(markFailed);
        return;
      }

      var helper = document.createElement('textarea');
      helper.value = codeText;
      helper.setAttribute('readonly', '');
      helper.style.position = 'absolute';
      helper.style.left = '-9999px';
      document.body.appendChild(helper);
      helper.select();

      try {
        document.execCommand('copy');
        markCopied();
      } catch (error) {
        markFailed();
      }

      document.body.removeChild(helper);
    });
  });
});


