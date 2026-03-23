const puppeteer = require('puppeteer');
const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const SCENES = [
  { file: 'scenes/01-hero.html',       name: '01-hero',       duration: 16, fps: 30 },
  { file: 'scenes/02-ai-insight.html',  name: '02-ai-insight', duration: 15, fps: 30 },
  { file: 'scenes/03-decision.html',    name: '03-decision',   duration: 15, fps: 30 },
  { file: 'scenes/04-queue.html',           name: '04-queue',          duration: 14, fps: 30 },
  { file: 'scenes/05-false-positive.html', name: '05-false-positive', duration: 11, fps: 30 },
  { file: 'scenes/06-before-after.html',   name: '06-before-after',   duration: 12, fps: 30 },
  { file: 'scenes/07-data-flow.html',      name: '07-data-flow',      duration: 11, fps: 30 },
];

const WIDTH = 1920;
const HEIGHT = 1080;

// Allow capturing a single scene via --scene flag
const args = process.argv.slice(2);
const sceneFilter = args.includes('--scene') ? args[args.indexOf('--scene') + 1] : null;

async function captureScene({ file, name, duration, fps }) {
  console.log(`\n  Capturing: ${name} (${duration}s @ ${fps}fps)`);

  const framesDir = path.resolve(`./frames/${name}`);
  const outputDir = path.resolve('./output');
  fs.mkdirSync(framesDir, { recursive: true });
  fs.mkdirSync(outputDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--allow-file-access-from-files',
      '--force-device-scale-factor=1',
      `--window-size=${WIDTH},${HEIGHT}`,
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });

  const filePath = `file://${path.resolve(file)}`;
  await page.goto(filePath, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  // Use Web Animations API to seek all animations to specific times
  // First, collect all animations and pause them
  await page.evaluate(() => {
    document.getAnimations({ subtree: true }).forEach(a => a.pause());
  });

  const totalFrames = Math.floor(duration * fps);
  const msPerFrame = 1000 / fps;

  for (let i = 0; i < totalFrames; i++) {
    const currentTimeMs = i * msPerFrame;

    // Seek all animations to the current time
    await page.evaluate((t) => {
      document.getAnimations({ subtree: true }).forEach(a => {
        a.currentTime = t;
      });
      window.__ANIM_TIME__ = t;
      window.dispatchEvent(new CustomEvent('animframe', { detail: { t } }));
    }, currentTimeMs);

    await page.screenshot({
      path: path.join(framesDir, `frame_${String(i).padStart(6, '0')}.png`),
      type: 'png',
      clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT },
    });

    if (i % fps === 0) {
      process.stdout.write(`  Frame ${i}/${totalFrames} (${(i / fps).toFixed(1)}s)\r`);
    }
  }

  await browser.close();
  console.log(`\n  ${totalFrames} frames captured`);

  // Encode MP4
  const mp4Out = path.join(outputDir, `${name}.mp4`);
  console.log(`  Encoding MP4...`);
  execFileSync('ffmpeg', [
    '-y',
    '-framerate', String(fps),
    '-i', path.join(framesDir, 'frame_%06d.png'),
    '-c:v', 'libx264',
    '-preset', 'slow',
    '-crf', '18',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    mp4Out,
  ], { stdio: 'inherit' });

  console.log(`  Output: ${mp4Out}`);

  // Cleanup frames
  fs.rmSync(framesDir, { recursive: true });
  console.log(`  Frames cleaned up`);
}

(async () => {
  const scenes = sceneFilter
    ? SCENES.filter(s => s.name.includes(sceneFilter))
    : SCENES;

  if (scenes.length === 0) {
    console.log('No matching scenes found.');
    process.exit(1);
  }

  for (const scene of scenes) {
    await captureScene(scene);
  }
  console.log('\nAll videos rendered!');
})();
