const offset = 20;
let mediaIndex = 0;
let mediaImages = [];

let mouseX = 0;
let mouseY = 0;

const img = document.createElement("img");
img.style.position = "fixed";
img.style.maxWidth = "50vw";
img.style.maxHeight = "90vh";
img.style.border = "2px solid gray";
img.style.borderRadius = "3px";
img.style.zIndex = "1000000";
img.hidden = true;
document.body.appendChild(img);

const indexBox = document.createElement("div");
indexBox.style.position = "fixed";
indexBox.style.backgroundColor = "gray";
indexBox.style.padding = "2px 4px";
indexBox.style.color = "white";
indexBox.style.fontSize = "12px";
indexBox.style.textAlign = "center";
indexBox.style.zIndex = "1000000";
indexBox.hidden = true;
document.body.appendChild(indexBox);

const positionImage = () => {
  if (mouseX > window.innerWidth * 0.5) {
    img.style.left = `${mouseX - img.width - offset}px`;
  } else {
    img.style.left = `${mouseX + offset}px`;
  }

  indexBox.style.left = `${mouseX - indexBox.clientWidth / 2}px`;

  if (mouseY > window.innerHeight * 0.5) {
    indexBox.style.top = `${mouseY - 2 * offset}px`;

    if (mouseY - img.height - offset <= 0) {
      img.style.top = `${offset}px`;
    } else {
      img.style.top = `${mouseY - img.height - offset}px`;
    }
  } else {
    indexBox.style.top = `${mouseY + 2 * offset}px`;

    if (mouseY + img.height + offset >= window.innerHeight) {
      img.style.top = `${window.innerHeight - img.height - offset}px`;
    } else {
      img.style.top = `${mouseY + offset}px`;
    }
  }
};

const supportedSites = ["i.redd.it", "imgur.com"];

const handleMouseEnter = async (e) => {
  const id = e.target.closest("shreddit-post").getAttribute("id");
  const url = `https://api.reddit.com/by_id/${id}`;
  const res = await fetch(url);
  const jsn = await res.json();
  const data = jsn.data.children[0].data;
  if (data.media_metadata) {
    mediaIndex = 0;
    mediaImages = [];
    const metaData = data.media_metadata;

    Object.keys(metaData).forEach((imageID) => {
      const meta = metaData[imageID];
      const type = meta.m.split("/")[1];
      const url = `https://i.redd.it/${meta.id}.${type}`;
      mediaImages.push(url);
    });

    img.src = mediaImages[mediaIndex];
    img.hidden = false;
    if (mediaImages.length > 1) {
      indexBox.innerText = `${mediaIndex + 1}/${mediaImages.length}`;
      indexBox.hidden = false;
    }
  } else {
    const imgUrl = data.url;
    let found = false;
    supportedSites.forEach((site) => {
      if (imgUrl.includes(site)) {
        found = true;
        img.src = imgUrl;
        img.hidden = false;
      }
    });
    if (!found) {
      console.log("unknown image url:", imgUrl, "id:", id);
    }
  }
};

const handleMouseLeave = () => {
  img.src = "";
  img.hidden = true;
  indexBox.hidden = true;
  mediaImages = [];
};

const handleLeftClick = (e) => {
  e.stopPropagation();
  e.preventDefault();

  if (mediaIndex < mediaImages.length - 1) {
    mediaIndex += 1;
    img.src = mediaImages[mediaIndex];
    indexBox.innerText = `${mediaIndex + 1}/${mediaImages.length}`;
  }
};

const handleRightClick = (e) => {
  e.preventDefault();
  e.stopPropagation();

  if (mediaIndex > 0) {
    mediaIndex -= 1;
    img.src = mediaImages[mediaIndex];
    indexBox.innerText = `${mediaIndex + 1}/${mediaImages.length}`;
  }
};

const setupEvents = () => {
  document.querySelectorAll("faceplate-img").forEach((p) => {
    p.removeEventListener("mouseenter", handleMouseEnter);
    p.addEventListener("mouseenter", handleMouseEnter);

    p.removeEventListener("mouseleave", handleMouseLeave);
    p.addEventListener("mouseleave", handleMouseLeave);

    p.removeEventListener("click", handleLeftClick);
    p.addEventListener("click", handleLeftClick);

    p.removeEventListener("contextmenu", handleRightClick);
    p.addEventListener("contextmenu", handleRightClick);
  });
};

img.addEventListener("load", positionImage);

document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  positionImage();
});

setupEvents();
setInterval(setupEvents, 5000);
