import express from "express";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

const app = express();

// 🎲 random iPhone 15–17
const devices = [
  {
    name: "iPhone 15 Pro",
    width: 393,
    height: 852,
    ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)"
  },
  {
    name: "iPhone 16 Pro",
    width: 402,
    height: 874,
    ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)"
  },
  {
    name: "iPhone 17 Pro",
    width: 430,
    height: 932,
    ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 19_0 like Mac OS X)"
  }
];

// 🚀 API CAP
app.get("/cap", async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.send("Thiếu url");

    const delay = Number(req.query.delay) || 3000;
    const full = req.query.full === "true";

    const device = devices[Math.floor(Math.random() * devices.length)];

    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless
    });

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

    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 60000
    });

    await page.waitForTimeout(delay);

    const img = await page.screenshot({
      fullPage: full
    });

    await browser.close();

    res.set("Content-Type", "image/png");
    res.send(img);

  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi cap: " + err.message);
  }
});

// 🏠 trang chủ
app.get("/", (req, res) => {
  res.send(`
    <h2>API CAP WEB 🚀</h2>
    <p>Dùng:</p>
    <code>/cap?url=https://google.com&delay=3000&full=true</code>
  `);
});

// 🔥 Render PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Running port " + PORT));
