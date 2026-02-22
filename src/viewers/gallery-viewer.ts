import type { Viewer, PostData } from "./types";
import ImageViewer from "./image-viewer";

export default class GalleryViewer implements Viewer {
  imgViewer: ImageViewer;
  indexBox: HTMLDivElement;

  index: number;
  images: string[];

  constructor() {
    this.imgViewer = new ImageViewer([]);
    this.indexBox = document.createElement("div");
    this.index = 0;
    this.images = [];
  }

  canHandle = (data: PostData) => {
    if (data.gallery_data && data.media_metadata) {
      return true;
    }

    return false;
  };

  display = (postData: PostData, mouseX: number, mouseY: number) => {
    const metaData = postData.media_metadata;
    const galleryData = postData.gallery_data.items;

    const mediaImages: string[] = [];

    galleryData.forEach((image) => {
      const meta = metaData[image.media_id];
      if (meta) {
        const type = meta.m.split("/")[1];
        const url = `https://i.redd.it/${meta.id}.${type}`;
        mediaImages.push(url);
      }
    });
    this.images = mediaImages;

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

    this.imgViewer.display(
      {
        url: this.images[this.index] ?? "",
        gallery_data: { items: [] },
        media_metadata: {},
        media: { reddit_video: { dash_url: "" } },
      },
      mouseX,
      mouseY,
    );
    this.position(mouseX, mouseY);
  };

  hide = () => {
    this.imgViewer.hide();
    document.body.removeChild(this.indexBox);

    this.images = [];
    this.index = 0;
  };

  leftClick = (mouseX: number, mouseY: number) => {
    if (this.index < this.images.length - 1) {
      this.index += 1;
      this.imgViewer.changeImg(this.images[this.index] ?? "", mouseX, mouseY);
      this.indexBox.innerText = `${this.index + 1}/${this.images.length}`;
    }
  };

  rightClick = (mouseX: number, mouseY: number) => {
    if (this.index > 0) {
      this.index -= 1;
      this.imgViewer.changeImg(this.images[this.index] ?? "", mouseX, mouseY);
      this.indexBox.innerText = `${this.index + 1}/${this.images.length}`;
    }
  };

  position = (mouseX: number, mouseY: number) => {
    let offset = 20;
    let indexBox = this.indexBox;

    this.imgViewer.position(mouseX, mouseY);

    indexBox.style.left = `${mouseX - indexBox.clientWidth / 2}px`;

    if (mouseY > window.innerHeight * 0.5) {
      indexBox.style.top = `${mouseY - 2 * offset}px`;
    } else {
      indexBox.style.top = `${mouseY + 2 * offset}px`;
    }
  };
}
