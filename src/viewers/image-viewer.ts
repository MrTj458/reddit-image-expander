import type { PostData, Viewer } from "./types";

export default class ImageViewer implements Viewer {
  supportedSites: string[];
  img: HTMLImageElement;

  constructor(supportedSites: string[]) {
    this.supportedSites = supportedSites;
    this.img = document.createElement("img");
  }

  canHandle = (data: PostData) => {
    for (let site of this.supportedSites) {
      if (data.url.includes(site)) {
        return true;
      }
    }
    return false;
  };

  display = (postData: PostData, mouseX: number, mouseY: number) => {
    const img = this.img;

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
  };

  hide = () => {
    if (this.img) {
      document.body.removeChild(this.img);
      this.img.src = "";
    }
  };

  leftClick = (mouseX: number, mouseY: number) => {};
  rightClick = (mouseX: number, mouseY: number) => {};

  position = (mouseX: number, mouseY: number) => {
    if (!this.img) {
      return;
    }

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

  changeImg = (url: string, mouseX: number, mouseY: number) => {
    if (this.img) {
      this.img.src = url;
      this.img.onload = () => this.position(mouseX, mouseY);
    }
  };
}
