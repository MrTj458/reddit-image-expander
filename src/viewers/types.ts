export type PostData = {
  url: string;
  gallery_data: {
    items: {
      media_id: string;
      id: number;
    }[];
  };
  media_metadata: {
    [key: string]: {
      id: string;
      m: string;
    };
  };
};

export interface Viewer {
  canHandle(data: PostData): boolean;
  display(postData: PostData, mouseX: number, mouseY: number): void;
  hide(): void;
  leftClick(mouseX: number, mouseY: number): void;
  rightClick(mouseX: number, mouseY: number): void;
  position(mouseX: number, mouseY: number): void;
}
