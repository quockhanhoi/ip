import express from "express";
import puppeteer from "puppeteer";

const app = express();

// 🎲 danh sách fake iPhone 15–17
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

app.get("/cap", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.send("Thiếu url");

  // 🎲 random device
  const device = devices[Math.floor(Math.random() * devices.length)];

  const browser = await puppeteer.launch({
    args: ["--no-sandbox"]
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
  await page.goto(url, { waitUntil: "networkidle2" });

  // ⏱ delay cho load full
  await page.waitForTimeout(3000);

  // 📸 chụp
  const img = await page.screenshot({
    fullPage: true
  });

  await browser.close();

  res.set("Content-Type", "image/png");
  res.send(img);
});

app.listen(3000, () => console.log("API chạy port 3000"));
