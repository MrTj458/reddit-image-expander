import type { Viewer, PostData } from "./types";

type EmbedURLConverter = {
  urls: string[];
  getEmbedURL(postData: PostData): string;
};

export default class IFrameViewer implements Viewer {
  frozen: boolean;
  width: number;
  height: number;
  frame: HTMLIFrameElement;

  urlConverters: EmbedURLConverter[];
  urlConverter: EmbedURLConverter | null;

  constructor(converters: EmbedURLConverter[]) {
    this.frozen = false;
    this.width = 0;
    this.height = 0;
    this.frame = document.createElement("iframe");
    this.urlConverters = converters;
    this.urlConverter = null;
  }

  canHandle = (postData: PostData) => {
    for (let handler of this.urlConverters) {
      for (let url of handler.urls) {
        if (postData.url.includes(url)) {
          this.urlConverter = handler;
          return true;
        }
      }
    }

    this.urlConverter = null;
    return false;
  };

  display = (postData: PostData, mouseX: number, mouseY: number) => {
    if (this.frozen || !this.urlConverter) {
      return;
    }

    this.width = window.innerWidth / 2;
    this.height = this.width / (16 / 9);

    const frame = this.frame;

    frame.style.position = "fixed";
    frame.style.width = `${this.width}px`;
    frame.style.height = `${this.height}px`;
    frame.style.border = "2px solid gray";
    frame.style.backgroundColor = "#000";
    frame.style.borderRadius = "3px";
    frame.scrolling = "no";
    frame.allow = "autoplay";
    frame.style.zIndex = "1000000";
    frame.src = this.urlConverter.getEmbedURL(postData);
    frame.onload = () => this.position(mouseX, mouseY);
    document.body.appendChild(frame);
    this.frame = frame;
  };

  hide = () => {
    if (this.frozen) {
      return;
    }

    document.body.removeChild(this.frame);
    this.frame.src = "";
  };

  leftClick = (mouseX: number, mouseY: number) => {
    if (this.frozen) {
      this.frozen = false;
      this.frame.style.border = "2px solid gray";
    } else {
      this.frozen = true;
      this.frame.style.border = "2px solid red";
    }
  };

  rightClick = (mouseX: number, mouseY: number) => {};

  position = (mouseX: number, mouseY: number) => {
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

export const youtubeEmbedConverter = {
  urls: ["youtu"],
  getEmbedURL: (postData: PostData) => {
    const parsedURL = new URL(postData.url);

    let videoID = parsedURL.searchParams.get("v");
    if (videoID === null) {
      // URL is probably the shortened youtu.be version
      videoID = parsedURL.pathname.split("/")[1] ?? "";
    }

    return `https://www.youtube.com/embed/${videoID}?autoplay=1`;
  },
};

export const gifEmbedConverter = {
  urls: ["dgif"],
  getEmbedURL: (postData: PostData) => {
    return postData.url.replace("watch", "ifr");
  },
};
