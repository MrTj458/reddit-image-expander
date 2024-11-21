class ImageHandler {
  supportedSites = ["i.redd.it", "imgur.com"];

  img = null;

  canHandle = (data) => {
    for (let site of this.supportedSites) {
      if (data.url.includes(site)) {
        return true;
      }
    }
    return false;
  };

  display = (postData, mouseX, mouseY) => {
    const img = document.createElement("img");

    img.style.position = "fixed";
    img.style.maxWidth = "50vw";
    img.style.maxHeight = "90vh";
    img.style.border = "2px solid gray";
    img.style.backgroundColor = "#000";
    img.style.borderRadius = "3px";
    img.style.zIndex = "1000000";

    img.src = postData.url;
    img.onload = () => this.position(mouseX, mouseY);

    document.body.appendChild(img);
    this.img = img;
  };

  changeImg = (url, mouseX, mouseY) => {
    this.img.src = url;
    this.img.onload = () => this.position(mouseX, mouseY);
  };

  hide = () => {
    document.body.removeChild(this.img);
  };

  position = (mouseX, mouseY) => {
    let offset = 20;
    let img = this.img;

    if (mouseX > window.innerWidth * 0.5) {
      img.style.left = `${mouseX - img.width - offset}px`;
    } else {
      img.style.left = `${mouseX + offset}px`;
    }

    if (mouseY > window.innerHeight * 0.5) {
      if (mouseY - img.height - 2 * offset <= 0) {
        img.style.top = `${offset}px`;
      } else {
        img.style.top = `${mouseY - img.height - offset}px`;
      }
    } else {
      if (mouseY + img.height + 2 * offset >= window.innerHeight) {
        img.style.top = `${window.innerHeight - img.height - offset}px`;
      } else {
        img.style.top = `${mouseY + offset}px`;
      }
    }
  };
}

class GalleryHandler {
  imgHandler = new ImageHandler();
  indexBox = null;

  index = 0;
  images = [];

  canHandle = (data) => {
    if (data.gallery_data && data.media_metadata) {
      return true;
    }

    return false;
  };

  display = (postData, mouseX, mouseY) => {
    const metaData = postData.media_metadata;
    const galleryData = postData.gallery_data.items;

    const mediaImages = [];

    galleryData.forEach((image) => {
      const meta = metaData[image.media_id];
      const type = meta.m.split("/")[1];
      const url = `https://i.redd.it/${meta.id}.${type}`;
      mediaImages.push(url);
    });
    this.mediaImages = mediaImages;

    const indexBox = document.createElement("div");
    indexBox.style.position = "fixed";
    indexBox.style.backgroundColor = "gray";
    indexBox.style.padding = "2px 4px";
    indexBox.style.color = "white";
    indexBox.style.fontSize = "12px";
    indexBox.style.textAlign = "center";
    indexBox.style.zIndex = "1000000";
    indexBox.innerText = `1/${mediaImages.length}`;
    document.body.appendChild(indexBox);
    this.indexBox = indexBox;

    this.imgHandler.display(
      { url: this.mediaImages[this.index] },
      mouseX,
      mouseY
    );
    this.position(mouseX, mouseY);
  };

  hide = () => {
    this.imgHandler.hide();
    document.body.removeChild(this.indexBox);

    this.mediaImages = [];
    this.index = 0;
  };

  leftClick = (mouseX, mouseY) => {
    if (this.index < this.mediaImages.length - 1) {
      this.index += 1;
      this.imgHandler.changeImg(this.mediaImages[this.index], mouseX, mouseY);
      this.indexBox.innerText = `${this.index + 1}/${this.mediaImages.length}`;
    }
  };

  rightClick = (mouseX, mouseY) => {
    if (this.index > 0) {
      this.index -= 1;
      this.imgHandler.changeImg(this.mediaImages[this.index], mouseX, mouseY);
      this.indexBox.innerText = `${this.index + 1}/${this.mediaImages.length}`;
    }
  };

  position = (mouseX, mouseY) => {
    let offset = 20;
    let indexBox = this.indexBox;

    this.imgHandler.position(mouseX, mouseY);

    indexBox.style.left = `${mouseX - indexBox.clientWidth / 2}px`;

    if (mouseY > window.innerHeight * 0.5) {
      indexBox.style.top = `${mouseY - 2 * offset}px`;
    } else {
      indexBox.style.top = `${mouseY + 2 * offset}px`;
    }
  };
}

class RedHandler {
  frozen = false;
  width = 0;
  height = 0;
  frame = null;

  canHandle = (postData) => {
    if (postData.url.includes("redgifs")) {
      return true;
    }

    return false;
  };

  display = (postData, mouseX, mouseY) => {
    if (this.frozen) {
      return;
    }

    this.width = window.innerWidth / 2;
    this.height = this.width / (16 / 9);

    const frame = document.createElement("iframe");

    frame.style.position = "fixed";
    frame.style.width = `${this.width}px`;
    frame.style.height = `${this.height}px`;
    frame.style.border = "2px solid gray";
    frame.style.backgroundColor = "#000";
    frame.style.borderRadius = "3px";
    frame.scrolling = "no";
    frame.style.zIndex = "1000000";
    frame.src = postData.url.replace("watch", "ifr");
    frame.onload = () => this.position(mouseX, mouseY);
    document.body.appendChild(frame);
    this.frame = frame;
  };

  hide = () => {
    if (this.frozen) {
      return;
    }

    document.body.removeChild(this.frame);
  };

  leftClick = () => {
    if (this.frozen) {
      this.frozen = false;
      this.frame.style.border = "2px solid gray";
    } else {
      this.frozen = true;
      this.frame.style.border = "2px solid red";
    }
  };

  position = (mouseX, mouseY) => {
    if (this.frozen) {
      return;
    }

    let offset = 20;

    if (mouseX > window.innerWidth * 0.5) {
      this.frame.style.left = `${mouseX - this.width - offset}px`;
    } else {
      this.frame.style.left = `${mouseX + offset}px`;
    }

    if (mouseY > window.innerHeight * 0.5) {
      if (mouseY - this.height - 2 * offset <= 0) {
        this.frame.style.top = `${offset}px`;
      } else {
        this.frame.style.top = `${mouseY - this.height - offset}px`;
      }
    } else {
      if (mouseY + this.height + 2 * offset >= window.innerHeight) {
        this.frame.style.top = `${window.innerHeight - this.height - offset}px`;
      } else {
        this.frame.style.top = `${mouseY + offset}px`;
      }
    }
  };
}

class PopupManager {
  handlers = [];
  handler = null;

  mouseX = 0;
  mouseY = 0;

  abortController = null;
  cache = {};

  constructor(handlers) {
    if (handlers) {
      this.handlers = handlers;
    }
  }

  start = () => {
    this.setupMouseListeners();
    this.setupImageListeners();
    setInterval(this.setupImageListeners, 5000);
  };

  setupMouseListeners = () => {
    document.addEventListener("mousemove", (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;

      if (this.handler) {
        this.handler.position(this.mouseX, this.mouseY);
      }
    });
  };

  setupImageListeners = () => {
    document.querySelectorAll("shreddit-post").forEach((p) => {
      const img = p.querySelector("img");

      try {
        img.removeEventListener("mouseenter", this.handleMouseEnter);
        img.removeEventListener("mouseleave", this.handleMouseLeave);
        img.removeEventListener("click", this.handleLeftClick);
        img.removeEventListener("contextmenu", this.handleRightClick);
      } catch (e) {}

      try {
        img.addEventListener("mouseenter", this.handleMouseEnter);
        img.addEventListener("mouseleave", this.handleMouseLeave);
        img.addEventListener("click", this.handleLeftClick);
        img.addEventListener("contextmenu", this.handleRightClick);
      } catch (e) {}
    });
  };

  handleMouseEnter = async (e) => {
    const postId = e.target.closest("shreddit-post").getAttribute("id");

    let postData = this.cache[postId];
    if (!postData) {
      this.abortController = new AbortController();

      try {
        const url = `https://api.reddit.com/by_id/${postId}`;
        const res = await fetch(url, { signal: this.abortController.signal });
        const jsn = await res.json();
        postData = jsn.data.children[0].data;
        this.cache[postId] = postData;
      } catch (e) {
        if (e.name === "AbortError") {
          return;
        }
        console.error(e);
        return;
      }
    }

    for (let handler of this.handlers) {
      if (handler.canHandle(postData)) {
        this.handler = handler;
        this.handler.display(postData, this.mouseX, this.mouseY);
        return;
      }
    }

    console.error(`no handlers support ${postData.url}`);
  };

  handleMouseLeave = () => {
    if (this.abortController) {
      this.abortController.abort();
    }

    if (!this.handler) {
      return;
    }

    this.handler.hide();
    this.handler = null;
  };

  handleLeftClick = (e) => {
    if (this.handler && this.handler.leftClick) {
      e.stopPropagation();
      e.preventDefault();
      this.handler.leftClick(this.mouseX, this.mouseY);
    }
  };

  handleRightClick = (e) => {
    if (this.handler && this.handler.rightClick) {
      e.stopPropagation();
      e.preventDefault();
      this.handler.rightClick(this.mouseX, this.mouseY);
    }
  };
}

const manager = new PopupManager([
  new ImageHandler(),
  new GalleryHandler(),
  new RedHandler(),
]);
manager.start();
