let inventory = JSON.parse(localStorage.getItem("inventory") || "{}");
let video;

function save() {
  localStorage.setItem("inventory", JSON.stringify(inventory));
}

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

    let name = prompt("商品名");

    if (!name) name = "商品";

    inventory[code] = {
      name: name,
      qty: 0
    };

  }

  inventory[code].qty++;

  save();

  render();

}

function editItem(code) {

  let newName = prompt("商品名変更", inventory[code].name);

  if (newName) {

    inventory[code].name = newName;

    save();

    render();

  }

}

function deleteItem(code) {

  if (confirm("削除しますか？")) {

    delete inventory[code];

    save();

    render();

  }

}

function render(list = inventory) {

  const log = document.getElementById("log");

  log.innerHTML = "<h3>在庫</h3>";

  for (const code in list) {

    const item = list[code];

    log.innerHTML += `
      <div style="margin-bottom:10px">
      <b>${item.name}</b><br>
      ${code}<br>
      在庫:${item.qty}<br>
      <button onclick="editItem('${code}')">編集</button>
      <button onclick="deleteItem('${code}')">削除</button>
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

function exportCSV() {

  let csv = "商品名,バーコード,在庫\n";

  for (const code in inventory) {

    const item = inventory[code];

    csv += `${item.name},${code},${item.qty}\n`;

  }

  const blob = new Blob([csv], { type: "text/csv" });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.href = url;

  a.download = "inventory.csv";

  a.click();

}

render();
