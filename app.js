let inventory = JSON.parse(localStorage.getItem("inventory") || "{}");
let video;

async function startScan() {
  if (!("BarcodeDetector" in window)) {
    alert("この端末はバーコード読み取り非対応です（Android Chrome推奨）");
    return;
  }

  const detector = new BarcodeDetector({
    formats: ["ean_13", "ean_8", "code_128"]
  });

  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" }
  });

  // video要素を作って画面に表示する
  video = document.createElement("video");
  video.srcObject = stream;
  video.setAttribute("playsinline", true);
  video.style.width = "100%";
  video.style.marginTop = "10px";
  document.body.prepend(video);
  await video.play();

  const interval = setInterval(async () => {
    const codes = await detector.detect(video);
    if (codes.length > 0) {
      const code = codes[0].rawValue;
      stream.getTracks().forEach(t => t.stop());
      clearInterval(interval);
      video.remove();
      addItem(code);
    }
  }, 500);
}

function addItem(code) {
  if (!inventory[code]) inventory[code] = 0;
  inventory[code]++;
  localStorage.setItem("inventory", JSON.stringify(inventory));
  render();
}

function render() {
  const log = document.getElementById("log");
  log.innerHTML = "<h3>在庫</h3>";
  for (const code in inventory) {
    log.innerHTML += `<div>${code}：${inventory[code]}</div>`;
  }
}

render();let inventory = JSON.parse(localStorage.getItem("inventory") || "{}");

async function startScan() {
  if (!("BarcodeDetector" in window)) {
    alert("この端末はバーコード読み取り非対応です（Android Chrome推奨）");
    return;
  }

  const detector = new BarcodeDetector({
    formats: ["ean_13", "ean_8", "code_128"]
  });

  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" }
  });

  const video = document.createElement("video");
  video.srcObject = stream;
  video.play();

  const interval = setInterval(async () => {
    const codes = await detector.detect(video);
    if (codes.length > 0) {
      const code = codes[0].rawValue;
      stream.getTracks().forEach(t => t.stop());
      clearInterval(interval);
      addItem(code);
    }
  }, 500);
}

function addItem(code) {
  if (!inventory[code]) inventory[code] = 0;
  inventory[code]++;
  localStorage.setItem("inventory", JSON.stringify(inventory));
  render();
}

function render() {
  const log = document.getElementById("log");
  log.innerHTML = "<h3>在庫</h3>";
  for (const code in inventory) {
    log.innerHTML += `<div>${code}：${inventory[code]}</div>`;
  }
}

render();
