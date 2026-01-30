/// <reference types="chrome"/>

chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.create({
    title: "Search on SauceNAO",
    contexts: ["image"],
    id: "searchOnSauceNAO",
  });
});

const handleSearch = (info: any) => {
  const url = new URL("https://saucenao.com/search.php");
  url.searchParams.set("url", info.srcUrl);
  chrome.tabs.create({ url: url.toString() });
};

chrome.contextMenus.onClicked.addListener(handleSearch);
