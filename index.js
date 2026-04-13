import express from "express";
import puppeteer from "puppeteer-core";
import chromium from "chromium";

const app = express();

// 🎲 fake iPhone 15–17
const devices = [
  {
    name: "iPhone 15 Pro",
    width: 393,
    height: 852,
    ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
  },
  {
    name: "iPhone 16 Pro",
    width: 402,
    height: 874,
    ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1"
  },
  {
    name: "iPhone 17 Pro",
    width: 430,
    height: 932,
    ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 19_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/19.0 Mobile/15E148 Safari/604.1"
  }
];

// 🌐 API cap
app.get("/cap", async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.send("Thiếu url");

    const delay = Number(req.query.delay) || 3000;
    const full = req.query.full === "true";

    const device = devices[Math.floor(Math.random() * devices.length)];

    const browser = await puppeteer.launch({
      executablePath: await chromium.executablePath,
      args: [
        ...chromium.args,
        "--no-sandbox",
        "--disable-setuid-sandbox"
      ],
      headless: true
    });

    const page = await browser.newPage();

    // 📱 fake mobile
    await page.setUserAgent(device.ua);
    await page.setViewport({
      width: device.width,
      height: device.height,
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 3
    });

    // 🌍 mở web
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 60000
    });

    await page.waitForTimeout(delay);

    // 📸 chụp
    const img = await page.screenshot({
      fullPage: full
    });

    await browser.close();

    res.set("Content-Type", "image/png");
    res.send(img);

  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi cap");
  }
});

// 🔥 dùng PORT của Render
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("API chạy port " + PORT);
});
