import type { Viewer, PostData } from "./types";
import * as dashjs from "dashjs";

export default class DashViewer implements Viewer {
  frozen: boolean;
  width: number;
  height: number;
  video: HTMLVideoElement | null;
  player: dashjs.MediaPlayerClass | null;

  constructor() {
    this.frozen = false;
    this.width = 0;
    this.height = 0;
    this.video = null;
    this.player = null;
  }

  canHandle = (postData: PostData) => {
    if (postData.url.includes("v.redd.it")) {
      return true;
    }

    return false;
  };

  display = (postData: PostData, mouseX: number, mouseY: number) => {
    if (this.frozen) {
      return;
    }

    this.width = window.innerWidth / 2;
    this.height = this.width / (16 / 9);

    const video = document.createElement("video");
    video.style.position = "fixed";
    video.style.width = `${this.width}px`;
    video.style.height = `${this.height}px`;
    video.style.border = "2px solid gray";
    video.style.backgroundColor = "#000";
    video.style.borderRadius = "3px";
    video.style.zIndex = "1000000";
    video.controls = true;

    const player = dashjs.MediaPlayer().create();
    player.initialize(video, postData.media.reddit_video.dash_url, true);

    this.video = video;
    this.player = player;

    document.body.appendChild(video);
    this.position(mouseX, mouseY);
  };

  hide = () => {
    if (this.frozen) {
      return;
    }

    if (this.video) {
      document.body.removeChild(this.video);
      this.video = null;
    }

    if (this.player) {
      this.player.destroy();
      this.player = null;
    }
  };

  leftClick = (mouseX: number, mouseY: number) => {
    if (!this.video) {
      return;
    }

    if (this.frozen) {
      this.frozen = false;
      this.video.style.border = "2px solid gray";
    } else {
      this.frozen = true;
      this.video.style.border = "2px solid red";
    }
  };

  rightClick = (mouseX: number, mouseY: number) => {};

  position = (mouseX: number, mouseY: number) => {
    if (this.frozen || !this.video) {
      return;
    }

    let offset = 20;

    if (mouseX > window.innerWidth * 0.5) {
      this.video.style.left = `${mouseX - this.width - offset}px`;
    } else {
      this.video.style.left = `${mouseX + offset}px`;
    }

    if (mouseY > window.innerHeight * 0.5) {
      if (mouseY - this.height - 2 * offset <= 0) {
        this.video.style.top = `${offset}px`;
      } else {
        this.video.style.top = `${mouseY - this.height - offset}px`;
      }
    } else {
      if (mouseY + this.height + 2 * offset >= window.innerHeight) {
        this.video.style.top = `${window.innerHeight - this.height - offset}px`;
      } else {
        this.video.style.top = `${mouseY + offset}px`;
      }
    }
  };
}
