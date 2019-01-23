const puppeteer = require('puppeteer');
const cloudinary = require('cloudinary');
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});
async function doScreenCapture(url, site_name) {
  const d = new Date();
  const current_time = `${d.getFullYear()}_${d.getMonth()+1}_
    ${d.getDate()}_${d.getHours()}_${d.getMinutes()}`
  const cloudinary_options = {
    public_id: `newsshot/${current_time}_${site_name}`
  };
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, {waitUntil: 'domcontentloaded'});
  let shotResult = await page.screenshot({fullPage: true})
    .then((result) => {
      console.log(`${site_name} got some results.`);
      return result;
    }).catch(e => {
      console.error(`[${site_name}] Error in snapshotting news`, e);
      return false;
    });
  if (shotResult){
    return cloundinaryPromise(shotResult, cloudinary_options);
  }else{
    return null;
  }
  await browser.close();
}
const news_sites = [
  {
    name: 'reuters',
    url: 'https://www.reuters.com/'
  }, {
    name: 'reuters_china',
    url: 'https://cn.reuters.com/'
  }, {
    name: 'reuters_japan',
    url: 'https://jp.reuters.com/'
  }, {
    name: 'reuters_germany',
    url: 'https://de.reuters.com/'
  }, {
    name: 'reuters_ara',
    url: 'https://ara.reuters.com/'
  }
];
function cloundinaryPromise(shotResult, cloudinary_options){
  return new Promise(function(res, rej){
    cloudinary.v2.uploader.upload_stream(cloudinary_options,
      function (error, cloudinary_result) {
        if (error){
          console.error('Upload to cloudinary failed: ', error);
          rej(error);
        }
        console.log(cloudinary_result);
        res(cloudinary_result);
      }
    ).end(shotResult);
  });
}
async function doSnapshots(news_sites) {
let cloundiary_promises = [];
  for (let i = 0; i < news_sites.length; i++) {
    try {
        let cloudinary_snapshot = await doScreenCapture(
          news_sites[i]['url'], news_sites[i]['name']);
        if (cloudinary_snapshot){
          cloundiary_promises.push(cloudinary_snapshot);
        }
    } catch(e) {
        console.error(`[${news_sites[i]['name']
          || 'Unknown site'}] Error in snapshotting news`, e);
    }
  }
Promise.all(cloundiary_promises).then(function(val) {
    process.exit();
  });
}
doSnapshots(news_sites);
