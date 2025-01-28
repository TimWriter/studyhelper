(() => {
  let premium_read_count = 0;
  const user_proxy_handler = {
    get(target, prop, receiver) {
      if (prop === "is_premium") {
        premium_read_count++;
        if (premium_read_count === 1) {
          return true;
        }
      }
      return Reflect.get(target, prop, receiver);
    },
  };

  window.sdWindow = new Proxy(
    {},
    {
      set(target, prop, value, receiver) {
        if (prop === "user") {
          value = new Proxy(value, user_proxy_handler);
        }
        return Reflect.set(target, prop, value, receiver);
      },
    }
  );
})();

((open) => {
  XMLHttpRequest.prototype.open = function (
    method,
    url,
    async,
    user,
    password
  ) {
    if (url.match(/.*studydrive\.net\/file-preview/g)) {
      this.addEventListener(
        "load",
        () => {
          let blob = new Blob([this.response], { type: "application/pdf" });
          let url = URL.createObjectURL(blob);
          const contextMenu = addContextMenu();
          addButtons(url, contextMenu);
        },
        false
      );
    }
    open.apply(this, arguments);
  };

  const addContextMenu = () => {
    const mk_toggle = () => {
      let toggle = document.createElement("div");
      toggle.classList.add("context-menu__toggle");
      toggle.textContent = "Helper";
      toggle.onclick = () => {
        let container = document.querySelector(".context-menu");
        if (container) {
          container.classList.toggle("context-menu--show");
        }
      };
      return toggle;
    };

    const mk_menu = () => {
      let menu = document.createElement("div");
      menu.classList.add("context-menu");
      menu.appendChild(mk_toggle());
      return menu;
    };
    const menu = mk_menu();
    document.body.appendChild(menu);
    return menu;
  };

  const addButtons = (url, contextMenu) => {
    const _id = "jsA7AGx6o2Yi61DvK8iooXEeQtgnKR";

    let el = document.getElementById(_id);
    if (el) {
      el.remove();
    }

    let m = window.location.href.match(/doc\/([^\/]+)/);
    let name = "studydrive-download.pdf";
    if (m && m[1]) {
      name = m[1] + ".pdf";
    }

    const btn_title =
      "Depending on the browser settings this might open and or download the file";

    const mk_btn = (label, options) => {
      let btn = document.createElement("a");
      btn.href = url;
      btn.classList.add("button-85");
      btn.role = "button";
      btn.title = btn_title;
      btn.textContent = label;

      if (options?.download) btn.download = name;
      if (options?.target) btn.target = options.target;

      return btn;
    };

    let container = document.createElement("div");
    container.id = _id;
    container.classList.add("context-menu__container");
    container.appendChild(mk_btn("Open", { target: "_blank" }));
    container.appendChild(mk_btn("Download", { download: true }));
    contextMenu.appendChild(container);
  };
})(XMLHttpRequest.prototype.open);

(() => {
  const removeAds = () => {
    const body = document.querySelector("body");

    if (!body) {
      console.error("Body tag not found!");
      return;
    }

    const observerCallback = (mutationsList) => {
      mutationsList.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "style"
        ) {
          const currentOverflow = getComputedStyle(body).overflow;
          if (currentOverflow === "hidden") {
            let el = document.querySelector(".overlay-background");
            if (el) {
              el.remove();
            }
            body.style.overflow = "visible";
          }
        }
      });
    };
    const observer = new MutationObserver(observerCallback);
    const config = { attributes: true, attributeFilter: ["style"] };

    observer.observe(body, config);
  };

  document.addEventListener("DOMContentLoaded", removeAds);
})();
