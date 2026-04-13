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

app.get("/cap", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.send("Thiếu url");

  const delay = Number(req.query.delay) || 3000;
  const full = req.query.full === "true";

  const device = devices[Math.floor(Math.random() * devices.length)];

  const browser = await puppeteer.launch({
    executablePath: await chromium.executablePath,
    args: chromium.args,
    headless: true
  });

  const page = await browser.newPage();

  await page.setUserAgent(device.ua);

  await page.setViewport({
    width: device.width,
    height: device.height,
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 3
  });

  await page.goto(url, { waitUntil: "networkidle2" });

  await page.waitForTimeout(delay);

  const img = await page.screenshot({
    fullPage: full
  });

  await browser.close();

  res.set("Content-Type", "image/png");
  res.send(img);
});

// 🔥 Render dùng PORT env
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("API chạy port " + PORT);
});
