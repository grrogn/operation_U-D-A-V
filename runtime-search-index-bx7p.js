document.addEventListener('DOMContentLoaded', function () {
  var searchWrap = document.getElementById('nav-search');
  if (!searchWrap) {
    return;
  }

  var form = searchWrap.querySelector('[data-post-search-form]');
  var input = searchWrap.querySelector('[data-post-search-input]');
  var results = searchWrap.querySelector('[data-post-search-results]');
  var hideSearch = searchWrap.querySelector('.hide-search');
  var SPECIAL_QUERY_ORDER = {
    sql: [
      '/blogs/outline-a-staging-sql-table-before-the-first-sync-gets-loud/',
      '/blogs/keep-an-upsert-window-calm-while-sql-metrics-continue-to-land/',
      '/blogs/shape-reporting-views-and-retention-checks-before-a-sql-dashboard-goes-live/',
      '/blogs/map-a-python-settings-layer-before-a-utility-script-starts-growing/',
      '/blogs/keep-python-side-effects-easy-to-trace-while-helper-functions-multiply/',
      '/blogs/leave-room-for-a-python-maintenance-loop-before-automation-turns-brittle/'
    ],
    sql2: [
      '/blogs/run-streaming-and-batch-traffic-circuits-before-hourly-metrics-start-piling-up/',
      '/blogs/model-short-horizon-traffic-forecasts-before-a-live-dashboard-starts-guessing/'
    ],
    sqlite2: [
      '/blogs/organize-streaming-and-batch-traffic-flows-before-hourly-rollups-start-stacking/',
      '/blogs/steady-short-horizon-traffic-forecast-windows-before-a-live-dashboard-starts-predicting/'
    ],
    python: [
      '/blogs/lay-out-a-traffic-intelligence-file-before-the-first-frame-arrives/',
      '/blogs/track-vehicles-frame-by-frame-and-paint-a-calm-overlay-in-pil/',
      '/blogs/persist-live-detections-and-roll-them-into-an-hourly-mart/',
      '/blogs/start-the-workers-once-and-cache-the-first-history-pull/',
      '/blogs/filter-a-streamlit-traffic-dashboard-without-turning-the-layout-into-glue/',
      '/blogs/validate-a-forecasting-loop-and-surface-dispatcher-warnings-without-noise/'
    ],
    python3: [
      '/blogs/shape-the-import-surface-of-a-python-analytics-service-before-the-live-loop/',
      '/blogs/keep-postgresql-lookups-cheap-while-a-vision-worker-boots-up/',
      '/blogs/turn-yolo-detections-into-per-frame-motion-buckets-without-losing-the-thread/',
      '/blogs/ship-live-metrics-into-postgresql-fan-them-out-and-keep-a-debug-overlay-nearby/',
      '/blogs/sketch-a-streamlit-analytics-page-with-filters-before-the-data-arrives/',
      '/blogs/query-recent-telemetry-and-draw-plotly-views-without-overcomplicating-the-refresh-cycle/',
      '/blogs/switch-between-live-mode-batch-export-and-safe-shutdown-in-one-python-entry-file/'
    ],
    dag: [
      '/blogs/shape-a-dag-ingestion-contract-before-the-etl-loop-goes-live/',
      '/blogs/keep-a-dag-transformation-flow-readable-while-quality-checks-accumulate/',
      '/blogs/close-a-dag-scheduler-loop-with-watermarks-audit-trails-and-sql-checks/',
      '/blogs/surface-a-dag-monitoring-console-before-quality-signals-start-drifting/',
      '/blogs/keep-dag-audit-history-readable-while-sidebar-metrics-refresh-live/'
    ],
    dag2: [
      '/blogs/wire-a-dag2-monitoring-sidebar-with-quality-logs-and-runtime-counts/'
    ],
    sqlite: [
      '/blogs/shape-a-streamlit-filter-bar-before-the-refresh-loop-starts-rushing/',
      '/blogs/cache-a-small-analytics-window-without-letting-fresh-state-go-missing/',
      '/blogs/let-an-auto-refresh-loop-breathe-before-the-whole-page-turns-restless/',
      '/blogs/keep-kpi-cards-honest-while-a-live-dashboard-keeps-moving/',
      '/blogs/group-a-time-series-for-plotly-without-tangling-the-main-view/',
      '/blogs/give-a-distribution-chart-a-stable-color-contract-before-it-starts-shouting/',
      '/blogs/finish-with-a-recent-events-table-so-operators-can-verify-the-story/'
    ]
  };

  if (!form || !input || !results) {
    return;
  }

  var posts = [
    {
        "title": "Some amazing similarities between people around the world",
        "url": "/blogs/some-amazing-similarities-between-people-around-the-world/",
        "meta": "/blogs/some-amazing-similarities-between-people-around-the-world/"
    },
    {
        "title": "Little known facts about deer worth knowing",
        "url": "/blogs/little-known-facts-about-deer-worth-knowing/",
        "meta": "/blogs/little-known-facts-about-deer-worth-knowing/"
    },
    {
        "title": "Shape the Import Surface of a Python Analytics Service Before the Live Loop",
        "url": "/blogs/shape-the-import-surface-of-a-python-analytics-service-before-the-live-loop/",
        "meta": "/blogs/shape-the-import-surface-of-a-python-analytics-service-before-the-live-loop/"
    },
    {
        "title": "Keep PostgreSQL Lookups Cheap While a Vision Worker Boots Up",
        "url": "/blogs/keep-postgresql-lookups-cheap-while-a-vision-worker-boots-up/",
        "meta": "/blogs/keep-postgresql-lookups-cheap-while-a-vision-worker-boots-up/"
    },
    {
        "title": "Turn YOLO Detections Into Per-Frame Motion Buckets Without Losing the Thread",
        "url": "/blogs/turn-yolo-detections-into-per-frame-motion-buckets-without-losing-the-thread/",
        "meta": "/blogs/turn-yolo-detections-into-per-frame-motion-buckets-without-losing-the-thread/"
    },
    {
        "title": "Ship Live Metrics Into PostgreSQL, Fan Them Out, and Keep a Debug Overlay Nearby",
        "url": "/blogs/ship-live-metrics-into-postgresql-fan-them-out-and-keep-a-debug-overlay-nearby/",
        "meta": "/blogs/ship-live-metrics-into-postgresql-fan-them-out-and-keep-a-debug-overlay-nearby/"
    },
    {
        "title": "Sketch a Streamlit Analytics Page With Filters Before the Data Arrives",
        "url": "/blogs/sketch-a-streamlit-analytics-page-with-filters-before-the-data-arrives/",
        "meta": "/blogs/sketch-a-streamlit-analytics-page-with-filters-before-the-data-arrives/"
    },
    {
        "title": "Query Recent Telemetry and Draw Plotly Views Without Overcomplicating the Refresh Cycle",
        "url": "/blogs/query-recent-telemetry-and-draw-plotly-views-without-overcomplicating-the-refresh-cycle/",
        "meta": "/blogs/query-recent-telemetry-and-draw-plotly-views-without-overcomplicating-the-refresh-cycle/"
    },
    {
        "title": "Switch Between Live Mode, Batch Export, and Safe Shutdown in One Python Entry File",
        "url": "/blogs/switch-between-live-mode-batch-export-and-safe-shutdown-in-one-python-entry-file/",
        "meta": "/blogs/switch-between-live-mode-batch-export-and-safe-shutdown-in-one-python-entry-file/"
    },
    {
        "title": "Lay Out a Traffic Intelligence File Before the First Frame Arrives",
        "url": "/blogs/lay-out-a-traffic-intelligence-file-before-the-first-frame-arrives/",
        "meta": "/blogs/lay-out-a-traffic-intelligence-file-before-the-first-frame-arrives/"
    },
    {
        "title": "Track Vehicles Frame by Frame and Paint a Calm Overlay in PIL",
        "url": "/blogs/track-vehicles-frame-by-frame-and-paint-a-calm-overlay-in-pil/",
        "meta": "/blogs/track-vehicles-frame-by-frame-and-paint-a-calm-overlay-in-pil/"
    },
    {
        "title": "Persist Live Detections and Roll Them Into an Hourly Mart",
        "url": "/blogs/persist-live-detections-and-roll-them-into-an-hourly-mart/",
        "meta": "/blogs/persist-live-detections-and-roll-them-into-an-hourly-mart/"
    },
    {
        "title": "Start the Workers Once and Cache the First History Pull",
        "url": "/blogs/start-the-workers-once-and-cache-the-first-history-pull/",
        "meta": "/blogs/start-the-workers-once-and-cache-the-first-history-pull/"
    },
    {
        "title": "Filter a Streamlit Traffic Dashboard Without Turning the Layout Into Glue",
        "url": "/blogs/filter-a-streamlit-traffic-dashboard-without-turning-the-layout-into-glue/",
        "meta": "/blogs/filter-a-streamlit-traffic-dashboard-without-turning-the-layout-into-glue/"
    },
    {
        "title": "Validate a Forecasting Loop and Surface Dispatcher Warnings Without Noise",
        "url": "/blogs/validate-a-forecasting-loop-and-surface-dispatcher-warnings-without-noise/",
        "meta": "/blogs/validate-a-forecasting-loop-and-surface-dispatcher-warnings-without-noise/"
      },
    {
        "title": "Outline a Staging Data Layer Before the First Sync Gets Loud",
        "url": "/blogs/outline-a-staging-sql-table-before-the-first-sync-gets-loud/",
        "meta": "/blogs/outline-a-staging-sql-table-before-the-first-sync-gets-loud/"
      },
    {
        "title": "Keep an Upsert Window Calm While Streamlit and Docker Layers Continue to Poll",
        "url": "/blogs/keep-an-upsert-window-calm-while-sql-metrics-continue-to-land/",
        "meta": "/blogs/keep-an-upsert-window-calm-while-sql-metrics-continue-to-land/"
      },
    {
        "title": "Shape Reporting Views and Retention Checks Before a Streamlit Dashboard Goes Live",
        "url": "/blogs/shape-reporting-views-and-retention-checks-before-a-sql-dashboard-goes-live/",
        "meta": "/blogs/shape-reporting-views-and-retention-checks-before-a-sql-dashboard-goes-live/"
      },
    {
        "title": "Run Streaming and Batch Traffic Circuits Before Hourly Metrics Start Piling Up",
        "url": "/blogs/run-streaming-and-batch-traffic-circuits-before-hourly-metrics-start-piling-up/",
        "meta": "/blogs/run-streaming-and-batch-traffic-circuits-before-hourly-metrics-start-piling-up/"
      },
    {
        "title": "Model Short-Horizon Traffic Forecasts Before a Live Dashboard Starts Guessing",
        "url": "/blogs/model-short-horizon-traffic-forecasts-before-a-live-dashboard-starts-guessing/",
        "meta": "/blogs/model-short-horizon-traffic-forecasts-before-a-live-dashboard-starts-guessing/"
      },
    {
        "title": "Stage Streaming and Batch Traffic Circuits Before Hourly Metrics Start Piling Up",
        "url": "/blogs/organize-streaming-and-batch-traffic-flows-before-hourly-rollups-start-stacking/",
        "meta": "/blogs/organize-streaming-and-batch-traffic-flows-before-hourly-rollups-start-stacking/"
      },
    {
        "title": "Tune Short-Horizon Traffic Forecasts Before a Live Dashboard Starts Guessing",
        "url": "/blogs/steady-short-horizon-traffic-forecast-windows-before-a-live-dashboard-starts-predicting/",
        "meta": "/blogs/steady-short-horizon-traffic-forecast-windows-before-a-live-dashboard-starts-predicting/"
      },
    {
        "title": "Map Python Language Defaults Before a Utility Script Starts Growing",
        "url": "/blogs/map-a-python-settings-layer-before-a-utility-script-starts-growing/",
        "meta": "/blogs/map-a-python-settings-layer-before-a-utility-script-starts-growing/"
      },
    {
        "title": "Keep Python Side Effects Easy to Trace While Utility Helpers Multiply",
        "url": "/blogs/keep-python-side-effects-easy-to-trace-while-helper-functions-multiply/",
        "meta": "/blogs/keep-python-side-effects-easy-to-trace-while-helper-functions-multiply/"
      },
    {
        "title": "Leave Room for a Python Runtime Maintenance Loop Before Automation Turns Brittle",
        "url": "/blogs/leave-room-for-a-python-maintenance-loop-before-automation-turns-brittle/",
        "meta": "/blogs/leave-room-for-a-python-maintenance-loop-before-automation-turns-brittle/"
      },
    {
        "title": "Shape a DAG Ingestion Contract Before the ETL Loop Goes Live",
        "url": "/blogs/shape-a-dag-ingestion-contract-before-the-etl-loop-goes-live/",
        "meta": "/blogs/shape-a-dag-ingestion-contract-before-the-etl-loop-goes-live/"
      },
    {
        "title": "Keep a DAG Transformation Flow Readable While Quality Checks Accumulate",
        "url": "/blogs/keep-a-dag-transformation-flow-readable-while-quality-checks-accumulate/",
        "meta": "/blogs/keep-a-dag-transformation-flow-readable-while-quality-checks-accumulate/"
      },
    {
        "title": "Close a DAG Scheduler Loop With Watermarks, Audit Trails, and SQL Checks",
        "url": "/blogs/close-a-dag-scheduler-loop-with-watermarks-audit-trails-and-sql-checks/",
        "meta": "/blogs/close-a-dag-scheduler-loop-with-watermarks-audit-trails-and-sql-checks/"
      },
    {
        "title": "Open a DAG Flow With Incremental Extract, Cleanup, and Enrichment",
        "url": "/blogs/surface-a-dag-monitoring-console-before-quality-signals-start-drifting/",
        "meta": "/blogs/surface-a-dag-monitoring-console-before-quality-signals-start-drifting/"
      },
    {
        "title": "Finish a DAG Flow With UPSERT, Watermarks, and Validation Queries",
        "url": "/blogs/keep-dag-audit-history-readable-while-sidebar-metrics-refresh-live/",
        "meta": "/blogs/keep-dag-audit-history-readable-while-sidebar-metrics-refresh-live/"
      },
    {
        "title": "Wire a DAG2 Monitoring Sidebar With Quality Logs and Runtime Counts",
        "url": "/blogs/wire-a-dag2-monitoring-sidebar-with-quality-logs-and-runtime-counts/",
        "meta": "/blogs/wire-a-dag2-monitoring-sidebar-with-quality-logs-and-runtime-counts/"
      },
    {
        "title": "Shape a Streamlit Filter Bar Before the Refresh Loop Starts Rushing",
        "url": "/blogs/shape-a-streamlit-filter-bar-before-the-refresh-loop-starts-rushing/",
        "meta": "/blogs/shape-a-streamlit-filter-bar-before-the-refresh-loop-starts-rushing/"
      },
    {
        "title": "Cache a Small Analytics Window Without Letting Fresh State Go Missing",
        "url": "/blogs/cache-a-small-analytics-window-without-letting-fresh-state-go-missing/",
        "meta": "/blogs/cache-a-small-analytics-window-without-letting-fresh-state-go-missing/"
      },
    {
        "title": "Keep KPI Cards Honest While a Live Dashboard Keeps Moving",
        "url": "/blogs/keep-kpi-cards-honest-while-a-live-dashboard-keeps-moving/",
        "meta": "/blogs/keep-kpi-cards-honest-while-a-live-dashboard-keeps-moving/"
      },
    {
        "title": "Group a Time Series for Plotly Without Tangling the Main View",
        "url": "/blogs/group-a-time-series-for-plotly-without-tangling-the-main-view/",
        "meta": "/blogs/group-a-time-series-for-plotly-without-tangling-the-main-view/"
      },
    {
        "title": "Give a Distribution Chart a Stable Color Contract Before It Starts Shouting",
        "url": "/blogs/give-a-distribution-chart-a-stable-color-contract-before-it-starts-shouting/",
        "meta": "/blogs/give-a-distribution-chart-a-stable-color-contract-before-it-starts-shouting/"
      },
    {
        "title": "Let an Auto-Refresh Loop Breathe Before the Whole Page Turns Restless",
        "url": "/blogs/let-an-auto-refresh-loop-breathe-before-the-whole-page-turns-restless/",
        "meta": "/blogs/let-an-auto-refresh-loop-breathe-before-the-whole-page-turns-restless/"
      },
    {
        "title": "Finish With a Recent Events Table So Operators Can Verify the Story",
        "url": "/blogs/finish-with-a-recent-events-table-so-operators-can-verify-the-story/",
        "meta": "/blogs/finish-with-a-recent-events-table-so-operators-can-verify-the-story/"
      }
  ];

  var postsById = {};
  posts.forEach(function (post) {
    postsById[post.url] = post;
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

  function getSpecialMatches(query) {
    var orderedIds = SPECIAL_QUERY_ORDER[query];
    if (!orderedIds) {
      return null;
    }

    return orderedIds.map(function (id) {
      return postsById[id] || null;
    }).filter(function (post) {
      return post !== null;
    });
  }

  function getMatches(query) {
    if (!query) {
      return [];
    }

    var specialMatches = getSpecialMatches(query);
    if (specialMatches) {
      return specialMatches;
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



