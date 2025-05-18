(() => {
  // Proxy override for is_premium
  let premiumReadCount = 0;
  const userProxyHandler = {
    get(target, prop, receiver) {
      if (prop === "is_premium" && premiumReadCount++ === 0) {
        return true;
      }
      return Reflect.get(target, prop, receiver);
    },
  };

  window.sdWindow = new Proxy({}, {
    set(target, prop, value, receiver) {
      if (prop === "user") value = new Proxy(value, userProxyHandler);
      return Reflect.set(target, prop, value, receiver);
    },
  });
})();

(() => {
  const FILE_PREVIEW_REGEX = /studydrive\.net\/file-preview/;
  const CONTAINER_ID = "jsA7AGx6o2Yi61DvK8iooXEeQtgnKR";
  const BUTTON_CLASS = "button-85";
  const BUTTON_TITLE = "Depending on browser settings, this may open or download the file.";

  const getFilename = () => {
    const match = window.location.href.match(/doc\/([^/]+)/);
    return (match?.[1] || "studydrive-download") + ".pdf";
  };

  const createButton = (label, url, options = {}) => {
    const btn = document.createElement("a");
    btn.href = url;
    btn.className = BUTTON_CLASS;
    btn.role = "button";
    btn.title = BUTTON_TITLE;
    btn.textContent = label;
    if (options.download) btn.download = getFilename();
    if (options.target) btn.target = options.target;
    return btn;
  };

  const ensureContextMenu = () => {
    let menu = document.querySelector(".context-menu");
    if (!menu) {
      menu = document.createElement("div");
      menu.className = "context-menu";

      const toggle = document.createElement("div");
      toggle.className = "context-menu__toggle";
      toggle.textContent = "Helper";
      toggle.onclick = () => menu.classList.toggle("context-menu--show");

      menu.appendChild(toggle);
      document.body.appendChild(menu);
    }
    return menu;
  };

  const addButtons = (blobUrl) => {
    document.getElementById(CONTAINER_ID)?.remove();

    const container = document.createElement("div");
    container.id = CONTAINER_ID;
    container.className = "context-menu__container";

    container.appendChild(createButton("Open", blobUrl, { target: "_blank" }));
    container.appendChild(createButton("Download", blobUrl, { download: true }));

    ensureContextMenu().appendChild(container);
  };

  const handleFilePreview = async (response) => {
    const blob = new Blob([await response], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);
    addButtons(blobUrl);
  };

  // Hook into XMLHttpRequest
  const originalXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (...args) {
    const url = args[1];
    if (FILE_PREVIEW_REGEX.test(url)) {
      this.addEventListener("load", () => handleFilePreview(this.response));
    }
    return originalXHROpen.apply(this, args);
  };

  // Hook into Fetch
  const originalFetch = window.fetch;
  window.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input?.url || "";
    const response = await originalFetch(input, init);

    if (FILE_PREVIEW_REGEX.test(url)) {
      const cloned = response.clone();
      handleFilePreview(await cloned.arrayBuffer());
    }

    return response;
  };
})();

// Remove overlay ads
(() => {
  const removeAds = () => {
    const body = document.body;
    if (!body) return console.error("Body tag not found!");

    new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === "style" && getComputedStyle(body).overflow === "hidden") {
          document.querySelector(".overlay-background")?.remove();
          body.style.overflow = "visible";
        }
      }
    }).observe(body, { attributes: true, attributeFilter: ["style"] });
  };

  document.addEventListener("DOMContentLoaded", removeAds);
})();