let inventory = JSON.parse(localStorage.getItem("inventory") || "{}");
let video;
let inventoryMode = false;

async function startScan() {

  if (!("BarcodeDetector" in window)) {
    alert("バーコード非対応");
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

    let name = prompt("商品名を入力");

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

function render(list = inventory) {

  const log = document.getElementById("log");

  log.innerHTML = "<h3>在庫</h3>";

  for (const code in list) {

    const item = list[code];

    log.innerHTML += `
      <div>
      ${item.name}
      <br>
      ${code}
      <br>
      在庫:${item.qty}
      </div>
      <hr>
    `;

  }

}

function searchItem() {

  const word = document.getElementById("search").value.toLowerCase();

  let result = {};

  for (const code in inventory) {

    const item = inventory[code];

    if (
      item.name.toLowerCase().includes(word) ||
      code.includes(word)
    ) {

      result[code] = item;

    }

  }

  render(result);

}

function startInventory() {

  alert("棚卸しモード開始");

  inventoryMode = true;

}

function endInventory() {

  alert("棚卸し終了");

  inventoryMode = false;

}

render();
