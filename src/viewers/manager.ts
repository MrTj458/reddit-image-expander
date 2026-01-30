import type { Viewer, PostData } from "./types";

export default class ViewerManager {
  viewers: Viewer[];
  viewer: Viewer | null;

  mouseX: number = 0;
  mouseY: number = 0;

  abortController: AbortController | null;
  cache: { [key: string]: PostData };

  constructor(viewers: Viewer[]) {
    this.viewers = viewers;
    this.viewer = null;
    this.mouseX = 0;
    this.mouseY = 0;

    this.abortController = null;
    this.cache = {};
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

      if (this.viewer) {
        this.viewer.position(this.mouseX, this.mouseY);
      }
    });
  };

  setupImageListeners = () => {
    document.querySelectorAll("shreddit-post").forEach((p) => {
      const img = p.querySelector("img");
      if (!img) {
        return;
      }

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

  handleMouseEnter = async (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const post = target.closest("shreddit-post");
    if (!post) {
      return;
    }
    const postId = post.getAttribute("id");
    if (!postId) {
      return;
    }

    let postData = this.cache[postId];
    if (!postData) {
      this.abortController = new AbortController();

      try {
        const url = `https://api.reddit.com/by_id/${postId}`;
        const res = await fetch(url, {
          headers: { Accept: "Application/json" },
          signal: this.abortController.signal,
        });
        const jsn = await res.json();
        postData = jsn.data.children[0].data;
        if (!postData) {
          return;
        }
        this.cache[postId] = postData;
      } catch (e: any) {
        if (e.name === "AbortError") {
          return;
        }
        console.error(e);
        return;
      }
    }

    for (let viewer of this.viewers) {
      if (viewer.canHandle(postData)) {
        this.viewer = viewer;
        this.viewer.display(postData, this.mouseX, this.mouseY);
        return;
      }
    }

    console.error(`no viewers support ${postData.url}`);
  };

  handleMouseLeave = () => {
    if (this.abortController) {
      this.abortController.abort();
    }

    if (!this.viewer) {
      return;
    }

    this.viewer.hide();
    this.viewer = null;
  };

  handleLeftClick = (e: PointerEvent) => {
    if (this.viewer && this.viewer.leftClick) {
      e.stopPropagation();
      e.preventDefault();
      this.viewer.leftClick(this.mouseX, this.mouseY);
    }
  };

  handleRightClick = (e: PointerEvent) => {
    if (this.viewer && this.viewer.rightClick) {
      e.stopPropagation();
      e.preventDefault();
      this.viewer.rightClick(this.mouseX, this.mouseY);
    }
  };
}
