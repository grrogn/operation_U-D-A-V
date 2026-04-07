(function () {
  function toInt(value, fallback) {
    var parsed = parseInt(value, 10);
    return isNaN(parsed) ? fallback : parsed;
  }

  function removeRevealClassLater(card) {
    window.setTimeout(function () {
      card.classList.remove("is-revealed-by-loadmore");
    }, 420);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var pager = document.getElementById("blog-pager");
    var trigger = document.querySelector("[data-load-more-trigger]");
    var grid = document.querySelector(".grid-posts");

    if (!pager || !trigger || !grid) {
      return;
    }

    var cards = Array.prototype.slice.call(
      grid.querySelectorAll(".blog-post.hentry.index-post")
    );

    if (!cards.length) {
      pager.hidden = true;
      return;
    }

    var initialCount = Math.max(
      1,
      toInt(trigger.getAttribute("data-load-more-initial"), 8)
    );
    var batchSize = Math.max(
      1,
      toInt(trigger.getAttribute("data-load-more-step"), 4)
    );
    var delayMs = Math.max(
      0,
      toInt(trigger.getAttribute("data-load-more-delay"), 720)
    );
    var visibleCount = Math.min(initialCount, cards.length);
    var isLoading = false;

    function syncCards() {
      cards.forEach(function (card, index) {
        if (index < visibleCount) {
          card.classList.remove("is-hidden-by-loadmore");
          card.removeAttribute("aria-hidden");
        } else {
          card.classList.add("is-hidden-by-loadmore");
          card.setAttribute("aria-hidden", "true");
        }
      });
    }

    function updateTriggerState() {
      var hasMore = visibleCount < cards.length;
      pager.classList.toggle("is-complete", !hasMore);

      if (!hasMore) {
        trigger.textContent = "All posts loaded";
        trigger.setAttribute("aria-disabled", "true");
        return;
      }

      trigger.textContent = "Load more posts";
      trigger.removeAttribute("aria-disabled");
    }

    function revealNextBatch() {
      if (isLoading || visibleCount >= cards.length) {
        return;
      }

      isLoading = true;
      pager.classList.add("is-loading");
      trigger.textContent = "Loading posts...";
      trigger.setAttribute("aria-busy", "true");

      window.setTimeout(function () {
        var revealFrom = visibleCount;
        var revealTo = Math.min(visibleCount + batchSize, cards.length);

        visibleCount = revealTo;

        for (var index = revealFrom; index < revealTo; index += 1) {
          cards[index].classList.remove("is-hidden-by-loadmore");
          cards[index].removeAttribute("aria-hidden");
          cards[index].classList.add("is-revealed-by-loadmore");
          removeRevealClassLater(cards[index]);
        }

        isLoading = false;
        pager.classList.remove("is-loading");
        trigger.removeAttribute("aria-busy");
        updateTriggerState();
      }, delayMs);
    }

    if (cards.length <= initialCount) {
      pager.hidden = true;
      return;
    }

    syncCards();
    updateTriggerState();

    trigger.addEventListener("click", function (event) {
      event.preventDefault();
      revealNextBatch();
    });
  });
})();


