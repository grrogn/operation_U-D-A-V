document.addEventListener('DOMContentLoaded', function () {
  var routeTools = window.SITE_ROUTES || {};
  var searchWrap = document.getElementById('nav-search');
  if (!searchWrap) {
    return;
  }

  var form = searchWrap.querySelector('[data-post-search-form]');
  var input = searchWrap.querySelector('[data-post-search-input]');
  var results = searchWrap.querySelector('[data-post-search-results]');
  var hideSearch = searchWrap.querySelector('.hide-search');

  if (!form || !input || !results) {
    return;
  }

  var posts = [
    {
        "title": "Some amazing similarities between people around the world",
        "url": "post1.html",
        "meta": "post1.html"
    },
    {
        "title": "Little known facts about deer worth knowing",
        "url": "post2.html",
        "meta": "post2.html"
    },
    {
        "title": "Shape the Import Surface of a Python Analytics Service Before the Live Loop",
        "url": "post3.html",
        "meta": "post3.html"
    },
    {
        "title": "Keep PostgreSQL Lookups Cheap While a Vision Worker Boots Up",
        "url": "post4.html",
        "meta": "post4.html"
    },
    {
        "title": "Turn YOLO Detections Into Per-Frame Motion Buckets Without Losing the Thread",
        "url": "post5.html",
        "meta": "post5.html"
    },
    {
        "title": "Ship Live Metrics Into PostgreSQL, Fan Them Out, and Keep a Debug Overlay Nearby",
        "url": "post6.html",
        "meta": "post6.html"
    },
    {
        "title": "Sketch a Streamlit Analytics Page With Filters Before the Data Arrives",
        "url": "post7.html",
        "meta": "post7.html"
    },
    {
        "title": "Query Recent Telemetry and Draw Plotly Views Without Overcomplicating the Refresh Cycle",
        "url": "post8.html",
        "meta": "post8.html"
    },
    {
        "title": "Switch Between Live Mode, Batch Export, and Safe Shutdown in One Python Entry File",
        "url": "post9.html",
        "meta": "post9.html"
    },
    {
        "title": "Lay Out a Traffic Intelligence File Before the First Frame Arrives",
        "url": "post10.html",
        "meta": "post10.html"
    },
    {
        "title": "Track Vehicles Frame by Frame and Paint a Calm Overlay in PIL",
        "url": "post11.html",
        "meta": "post11.html"
    },
    {
        "title": "Persist Live Detections and Roll Them Into an Hourly Mart",
        "url": "post12.html",
        "meta": "post12.html"
    },
    {
        "title": "Start the Workers Once and Cache the First History Pull",
        "url": "post13.html",
        "meta": "post13.html"
    },
    {
        "title": "Filter a Streamlit Traffic Dashboard Without Turning the Layout Into Glue",
        "url": "post14.html",
        "meta": "post14.html"
    },
    {
        "title": "Validate a Forecasting Loop and Surface Dispatcher Warnings Without Noise",
        "url": "post15.html",
        "meta": "post15.html"
      }
  ];

  posts = posts.map(function (post) {
    var cleanPath = routeTools.getPostPath ? routeTools.getPostPath(post.url) : post.url;

    return {
      title: post.title,
      url: cleanPath,
      meta: cleanPath
    };
  });

  function escapeHtml(value) {
    return value.replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function normalize(value) {
    return value.toLowerCase().trim();
  }

  function getMatches(query) {
    if (!query) {
      return [];
    }

    var words = query.split(/\s+/).filter(Boolean);

    return posts.map(function (post) {
      var title = normalize(post.title);
      var url = normalize(post.url);
      var haystack = title + ' ' + url;
      var matchesAllWords = words.every(function (word) {
        return haystack.indexOf(word) !== -1;
      });

      if (!matchesAllWords) {
        return null;
      }

      var titleIndex = title.indexOf(query);
      var urlIndex = url.indexOf(query);
      var bestIndex = titleIndex !== -1 ? titleIndex : 100 + (urlIndex !== -1 ? urlIndex : 999);

      return {
        post: post,
        score: bestIndex
      };
    }).filter(function (item) {
      return item !== null;
    }).sort(function (left, right) {
      return left.score - right.score;
    }).slice(0, 6).map(function (item) {
      return item.post;
    });
  }

  function hideResults() {
    results.classList.remove('is-visible');
    results.innerHTML = '';
  }

  function renderResults(matches) {
    if (!matches.length) {
      results.innerHTML = '<div class="search-suggestion-empty">No matching posts found.</div>';
      results.classList.add('is-visible');
      return;
    }

    results.innerHTML = matches.map(function (post) {
      return (
        '<a class="search-suggestion-item" href="' + post.url + '">' +
          '<span class="search-suggestion-title">' + escapeHtml(post.title) + '</span>' +
          '<span class="search-suggestion-meta">' + escapeHtml(post.meta) + '</span>' +
        '</a>'
      );
    }).join('');

    results.classList.add('is-visible');
  }

  function refreshResults() {
    var query = normalize(input.value);
    if (!query) {
      hideResults();
      return [];
    }

    var matches = getMatches(query);
    renderResults(matches);
    return matches;
  }

  input.addEventListener('input', refreshResults);

  input.addEventListener('focus', function () {
    refreshResults();
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var matches = refreshResults();
    if (matches[0]) {
      window.location.href = matches[0].url;
    }
  });

  results.addEventListener('click', function (event) {
    var link = event.target.closest('a');
    if (!link) {
      return;
    }

    hideResults();
  });

  if (hideSearch) {
    hideSearch.addEventListener('click', hideResults);
  }

  document.addEventListener('click', function (event) {
    if (!searchWrap.contains(event.target) && event.target !== document.querySelector('.show-search')) {
      hideResults();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      hideResults();
    }
  });
});
