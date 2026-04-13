import express from "express";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

const app = express();

let browser;

// 📱 iPhone 14–17
const devices = [
  { width: 393, height: 852, ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)" },
  { width: 393, height: 852, ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)" },
  { width: 402, height: 874, ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)" },
  { width: 430, height: 932, ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 19_0 like Mac OS X)" }
];

// 🚀 mở browser 1 lần (fix ETXTBSY)
async function getBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      executablePath: await chromium.executablePath(),
      args: [
        ...chromium.args,
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--single-process",
        "--no-zygote"
      ],
      headless: true
    });
  }
  return browser;
}

// 🔥 preload tránh 502
getBrowser();

// 📸 API
app.get("/cap", async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.send("Thiếu url");

    const full = req.query.full === "true";

    const device = devices[Math.floor(Math.random() * devices.length)];

    const browser = await getBrowser();
    const page = await browser.newPage();

    // 📱 fake iPhone
    await page.setUserAgent(device.ua);
    await page.setViewport({
      width: device.width,
      height: device.height,
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 3
    });

    // ⚡ load nhanh, không treo
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 15000
    }).catch(() => {});

    // delay nhẹ
    await new Promise(r => setTimeout(r, 1500));

    const img = await page.screenshot({
      fullPage: full
    });

    await page.close();

    res.set("Content-Type", "image/png");
    res.send(img);

  } catch (err) {
    console.error(err);
    res.status(200).send("cap lỗi nhưng server vẫn sống");
  }
});

// 🏠 home
app.get("/", (req, res) => {
  res.send(`
    <h2>API CAP FINAL 🚀</h2>
    <p>/cap?url=https://example.com&full=true</p>
  `);
});

// 🔥 PORT chuẩn Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Running port " + PORT));
