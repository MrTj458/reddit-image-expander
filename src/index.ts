import ViewerManager from "./viewers/manager";
import ImageViewer from "./viewers/image-viewer";
import GalleryViewer from "./viewers/gallery-viewer";
import DashViewer from "./viewers/dash-viewer";
import IFrameViewer, {
  gifEmbedConverter,
  youtubeEmbedConverter,
} from "./viewers/iframe-viewer";

const manager = new ViewerManager([
  new ImageViewer(["i.redd.it", "imgur.com", "files.catbox.moe"]),
  new GalleryViewer(),
  new IFrameViewer([youtubeEmbedConverter, gifEmbedConverter]),
  new DashViewer(),
]);

manager.start();
