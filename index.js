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

// 🚀 mở browser 1 lần
async function getBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--single-process",
        "--no-zygote"
      ],
      executablePath: await chromium.executablePath(),
      headless: chromium.headless
    });
  }
  return browser;
}

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

    // ⚡ load nhanh kiểu API
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 20000
    }).catch(() => {});

    await new Promise(r => setTimeout(r, 2000));

    const img = await page.screenshot({
      fullPage: full,
      type: "png"
    });

    await page.close();

    res.set("Content-Type", "image/png");
    res.send(img);

  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi cap");
  }
});

// 🏠 home
app.get("/", (req, res) => {
  res.send("API CAP IPHONE 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT);
