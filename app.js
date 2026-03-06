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

  video = document.createElement("video");
  video.srcObject = stream;
  video.setAttribute("playsinline", true);
  video.style.width = "100%";
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

  if (!inventory[code]) {

    let name = prompt("この商品の名前を入力してください");

    if (!name) name = "商品";

    inventory[code] = {
      name: name,
      qty: 0
    };

  }

  inventory[code].qty++;

  localStorage.setItem("inventory", JSON.stringify(inventory));

  render();
}

function render() {

  const log = document.getElementById("log");

  log.innerHTML = "<h3>在庫</h3>";

  for (const code in inventory) {

    const item = inventory[code];

    log.innerHTML += `
      <div>
      ${item.name}  
      (バーコード:${code})  
      ：${item.qty}
      </div>
    `;

  }

}

render();
