import express from "express";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import puppeteerExtra from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import axios from "axios";

puppeteerExtra.use(StealthPlugin());

const app = express();

let browser;

// 📱 iPhone 14–17 FULL
const devices = [
  {
    name: "iPhone 14 Pro",
    width: 393,
    height: 852,
    ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)"
  },
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

// 🌍 lấy proxy free
async function getProxy() {
  try {
    const res = await axios.get("https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt");
    const list = res.data.split("\n").filter(x => x.includes(":"));
    return list[Math.floor(Math.random() * list.length)];
  } catch {
    return null;
  }
}

// 🚀 browser reuse
async function getBrowser(proxy) {
  if (!browser) {
    browser = await puppeteerExtra.launch({
      args: [
        ...chromium.args,
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--single-process",
        "--no-zygote",
        ...(proxy ? [`--proxy-server=http://${proxy}`] : [])
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

    const delay = Number(req.query.delay) || 3000;
    const full = req.query.full === "true";

    const proxy = await getProxy();
    console.log("Proxy:", proxy);

    const device = devices[Math.floor(Math.random() * devices.length)];
    console.log("Device:", device.name);

    const browser = await getBrowser(proxy);
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

    // 🌍 fake header + timezone
    await page.setExtraHTTPHeaders({
      "accept-language": "en-US,en;q=0.9"
    });
    await page.emulateTimezone("Asia/Ho_Chi_Minh");

    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 60000
    });

    await page.waitForTimeout(delay);

    const img = await page.screenshot({
      fullPage: full
    });

    await page.close();

    res.set("Content-Type", "image/png");
    res.send(img);

  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi cap: " + err.message);
  }
});

// 🏠 home
app.get("/", (req, res) => {
  res.send(`
    <h2>API CAP PRO MAX 🚀</h2>
    <p>/cap?url=https://google.com&delay=3000&full=true</p>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Running " + PORT));
