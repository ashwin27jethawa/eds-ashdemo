/*
 * Embed Block
 * Show videos, social posts, and documents directly on your page
 * https://www.hlx.live/developer/block-collection/embed
 */

/*
 * Embed Block
 * Show videos, social posts, and documents directly on your page
 * https://www.hlx.live/developer/block-collection/embed
 */

const domainUrl = window.location.origin;

const loadScript = (url, callback, type) => {
  const head = document.querySelector("head");
  const script = document.createElement("script");
  script.src = url;
  if (type) {
    script.setAttribute("type", type);
  }
  script.onload = callback;
  head.append(script);
  return script;
};

const getDefaultEmbed = (
  url,
) => `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
    <iframe src="${url.href}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen=""
      scrolling="no" allow="encrypted-media" title="Content from ${url.hostname}" loading="lazy">
    </iframe>
  </div>`;

const damVideo = (url, autoplay) =>
  `<div style="left: 0; width: 100%; height: 100%; padding-bottom: 56.25%;">
    <video ${autoplay ? "autoplay muted" : ""}  controls style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute; border-radius: 20px;" title="Video" loading="lazy">
      <source src="${domainUrl}${url.pathname}" type="video/mp4" >
      Your browser does not support the video tag.
    </video>
  </div>`;

const embedYoutube = (url, autoplay) => {
  const usp = new URLSearchParams(url.search);
  const suffix = autoplay ? "&muted=1&autoplay=1" : "";
  let vid = usp.get("v") ? encodeURIComponent(usp.get("v")) : "";
  const embed = url.pathname;
  if (url.origin.includes("youtu.be")) {
    [, vid] = url.pathname.split("/");
  }
  const embedHTML = `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
      <iframe src="https://www.youtube.com${vid ? `/embed/${vid}?rel=0&v=${vid}${suffix}` : embed}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;"
      allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope; picture-in-picture" allowfullscreen="" scrolling="no" title="Content from Youtube" loading="lazy"></iframe>
    </div>`;
  return embedHTML;
};

const embedVimeo = (url, autoplay) => {
  const [, video] = url.pathname.split("/");
  const suffix = autoplay ? "?muted=1&autoplay=1" : "";
  const embedHTML = `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
      <iframe src="https://player.vimeo.com/video/${video}${suffix}"
      style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;"
      frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen
      title="Content from Vimeo" loading="lazy"></iframe>
    </div>`;
  return embedHTML;
};

const embedTwitter = (url) => {
  const embedHTML = `<blockquote class="twitter-tweet"><a href="${url.href}"></a></blockquote>`;
  loadScript("https://platform.twitter.com/widgets.js");
  return embedHTML;
};

// Direct iFrame Document Embed (Best for Helix Same-Domain / Proxied PDFs & Sheets)
const embedDocument = (url) => {
  const isPdf = url.pathname.toLowerCase().endsWith(".pdf");
  const docUrl = isPdf ? `${domainUrl}${url.pathname}` : url.href;

  return `<div class="embed-document-container" style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
      <div class="pdf-loading">Loading document&hellip;</div>
      <iframe class="pdf-frame" data-doc-url="${docUrl}" data-is-pdf="${isPdf}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;"
      title="Document" loading="lazy" allowfullscreen></iframe>
    </div>`;
};

// DAM PDFs respond with a `frame-ancestors` CSP that blocks direct framing.
// Fetching the file and pointing the iframe at a blob: URL bypasses that response
// header entirely, and the browser renders its native PDF viewer/toolbar for it.
async function hydrateDocumentEmbed(block) {
  const container = block.querySelector(".embed-document-container");
  const iframe = container?.querySelector(".pdf-frame");
  const loading = container?.querySelector(".pdf-loading");
  if (!iframe) return;

  const { docUrl } = iframe.dataset;
  const isPdf = iframe.dataset.isPdf === "true";

  if (!isPdf) {
    iframe.src = docUrl;
    loading?.remove();
    return;
  }

  try {
    const response = await fetch(docUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch document: ${response.status}`);
    }
    const blob = await response.blob();
    // Hide the sidebar and default to fit-width zoom in the native PDF viewer
    iframe.src = `${URL.createObjectURL(blob)}#navpanes=0&view=FitH`;
  } catch {
    const link = document.createElement("a");
    link.href = docUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.className = "button pdf-fallback-link";
    link.textContent = "Open document";
    iframe.replaceWith(link);
  } finally {
    loading?.remove();
  }
}

const embedAudio = (url) => {
  const extension = url.pathname.split(".").pop().toLowerCase();
  const audioType =
    {
      mp3: "audio/mpeg",
      wav: "audio/wav",
      ogg: "audio/ogg",
      m4a: "audio/mp4",
    }[extension] || "audio/mpeg";

  return `<div class="audio-player podcast-panel">
    <audio class="podcast-audio">
      <source src="${url.href}" type="${audioType}">
    </audio>

    <div class="progress-container">
      <span class="current-time time-text">00:00</span>
      <input type="range" class="progress-bar" value="0" min="0" max="100" step="0.1">
      <span class="duration time-text">00:00</span>
    </div>

    <div class="controls-container">
      <button class="icon-btn rewind-btn" title="Rewind 10 seconds">
        <img src="/icons/rotate-left.svg" alt="Rewind 10 seconds" width="28" height="28">
      </button>

      <button class="play-btn" title="Play">
        <img class="play-icon" src="/icons/play-circle-red.svg" alt="Play" width="56" height="56">
        <img class="pause-icon hidden" src="/icons/pause-circle.svg" alt="Pause" width="56" height="56">
      </button>

      <button class="icon-btn forward-btn" title="Forward 10 seconds">
        <img src="/icons/rotate-right.svg" alt="Forward 10 seconds" width="28" height="28">
      </button>
    </div>
  </div>`;
};

// Initialize podcast player functionality
function initPodcastPlayer(container) {
  const audio = container.querySelector(".podcast-audio");
  const playPauseBtn = container.querySelector(".play-btn");
  const playIcon = container.querySelector(".play-icon");
  const pauseIcon = container.querySelector(".pause-icon");
  const rewindBtn = container.querySelector(".rewind-btn");
  const forwardBtn = container.querySelector(".forward-btn");
  const progressBar = container.querySelector(".progress-bar");
  const currentTimeEl = container.querySelector(".current-time");
  const durationEl = container.querySelector(".duration");

  function formatTime(seconds) {
    if (Number.isNaN(seconds) || !Number.isFinite(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }

  audio.addEventListener("loadedmetadata", () => {
    durationEl.textContent = formatTime(audio.duration);
    progressBar.max = audio.duration;
  });

  playPauseBtn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play();
      playIcon.classList.add("hidden");
      pauseIcon.classList.remove("hidden");
    } else {
      audio.pause();
      playIcon.classList.remove("hidden");
      pauseIcon.classList.add("hidden");
    }
  });

  rewindBtn.addEventListener("click", () => {
    audio.currentTime = Math.max(0, audio.currentTime - 10);
  });

  forwardBtn.addEventListener("click", () => {
    audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
  });

  audio.addEventListener("timeupdate", () => {
    progressBar.value = audio.currentTime;
    currentTimeEl.textContent = formatTime(audio.currentTime);
    const progressPercent = (audio.currentTime / audio.duration) * 100;
    progressBar.style.backgroundSize = `${progressPercent}% 100%`;
  });

  progressBar.addEventListener("input", () => {
    audio.currentTime = progressBar.value;
    const progressPercent = (progressBar.value / audio.duration) * 100;
    progressBar.style.backgroundSize = `${progressPercent}% 100%`;
  });

  audio.addEventListener("ended", () => {
    playIcon.classList.remove("hidden");
    pauseIcon.classList.add("hidden");
    progressBar.value = 0;
    progressBar.style.backgroundSize = "0% 100%";
    currentTimeEl.textContent = "00:00";
  });
}

const loadEmbed = (block, link, autoplay) => {
  if (block.classList.contains("embed-is-loaded")) {
    return;
  }

  const EMBEDS_CONFIG = [
    {
      match: ["youtube", "youtu.be"],
      embed: embedYoutube,
      className: "youtube",
    },
    {
      match: ["vimeo"],
      embed: embedVimeo,
      className: "vimeo",
    },
    {
      match: ["twitter"],
      embed: embedTwitter,
      className: "twitter",
    },
    {
      match: [".pdf"],
      embed: embedDocument,
      className: "pdf",
    },
    {
      match: ["docs.google.com/spreadsheets"],
      embed: embedDocument,
      className: "google-sheet",
    },
    {
      match: [".mp3", ".wav", ".ogg", ".m4a"],
      embed: embedAudio,
      className: "audio",
    },
    {
      match: [".mp4", ".webm", ".ogg"],
      embed: damVideo,
      className: "video",
    },
  ];

  const config = EMBEDS_CONFIG.find((e) =>
    e.match.some((match) => link.includes(match)),
  );

  const url = new URL(link);

  if (config) {
    block.innerHTML = config.embed(url, autoplay);
    block.classList = `block embed embed-${config.className}`;

    // NEW: Add the custom "pdf-block" class for both PDFs and Google Sheets
    if (config.className === "pdf" || config.className === "google-sheet") {
      block.classList.add("pdf-block");
      hydrateDocumentEmbed(block);
    }

    // Initialize podcast player if audio block
    if (config.className === "audio") {
      initPodcastPlayer(block);
    }
  } else {
    block.innerHTML = getDefaultEmbed(url);
    block.classList = "block embed";
  }
  block.classList.add("embed-is-loaded");
};

function isYouTubeLink(url) {
  try {
    const hostname = new URL(url).hostname.toLowerCase();

    return (
      hostname === "youtu.be" ||
      hostname === "www.youtube.com" ||
      hostname === "youtube.com" ||
      hostname === "m.youtube.com"
    );
  } catch {
    return false;
  }
}

export default function decorate(block) {
  const placeholder = block.querySelector("picture");
  const a = block.querySelector("a");

  // SAFETY GUARD: If no link is found, exit the function immediately to prevent crashes
  if (!a) {
    return;
  }

  const link = a.href;
  block.textContent = ""; // Clear the block content

  if (placeholder) {
    const wrapper = document.createElement("div");
    wrapper.className = "embed-placeholder";
    if (isYouTubeLink(link)) {
      // console.log('YouTube link detected:', link); // Debugging: Log if it's a YouTube link
      wrapper.innerHTML =
        '<div class="embed-placeholder-play"><button type="button" title="Play"><img src="/icons/youtube.svg" alt="Play" class="play-icon"></button></div>';
    } else {
      wrapper.innerHTML =
        '<div class="embed-placeholder-play"><button type="button" title="Play"><img src="/icons/play-circle.svg" alt="Play" class="play-icon"></button></div>';
    }
    wrapper.prepend(placeholder);
    wrapper.addEventListener("click", () => {
      loadEmbed(block, link, true);
    });
    block.append(wrapper);
  } else {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        loadEmbed(block, link);
      }
    });
    observer.observe(block);
  }
}
