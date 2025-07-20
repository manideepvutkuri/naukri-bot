// // bot.js
//  const puppeteer = require('puppeteer');
//  const fs = require('fs'); 
//  let applied = [];

//  try {
//     applied = JSON.parse(fs.readFileSync('./applied.json'));
//  } catch {
//     applied = []
//  }
//  const config = require('./config.json');
// const { promises } = require('dns');
// // let applied = require('./applied.json');

// (async () => { try { const browser = await puppeteer.launch({ headless: false, defaultViewport: null }); const page = await browser.newPage();

// // Step 1: Go to Naukri login page
// await page.goto('https://www.naukri.com/mnjuser/login', { waitUntil: 'domcontentloaded' });
// console.log("\u23F3 Please login to Naukri manually (waiting 60 sec)...");
// await new Promise(resolve => setTimeout(resolve, 60000)); // wait 60 sec for manual login

// // Step 2: Navigate to job search page
// const keyword = "angular developer";
// const searchURL = `https://www.naukri.com/${keyword.replace(/ /g, '-')}-jobs`;
// console.log("🔍 Navigating to:", searchURL);
// await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115 Safari/537.36");
// await page.goto(searchURL, { waitUntil: 'domcontentloaded' });

// // Step 3: Wait for job listings
// try {
//     await page.waitForSelector('.cust-job-tuple', { timeout: 30000 });
//     console.log("✅ Job listings loaded.");
//   } catch (err) {
//     await page.screenshot({ path: 'error.png', fullPage: true });
//     console.log("❌ Job listings not found. Screenshot saved as error.png.");
//     await browser.close();
//     return;
//   }
  
//   // Step 4: Extract job info
//   const jobs = await page.$$eval('.cust-job-tuple', tuples => {
//     return tuples.map(tuple => {
//       const link = tuple.querySelector('a.title')?.href || '';
//       const title = tuple.querySelector('a.title')?.innerText.trim() || '';
//       const company = tuple.querySelector('.comp-dtls-wrap a')?.innerText.trim() || '';
//       return { title, company, link };
//     });
//   });
  
//   console.log(`✅ Found ${jobs.length} job(s).`);


// // Step 5: Loop through jobs
// for (const job of jobs) {
//   if (!job.link || applied.find(j => j.link === job.link)) {
//     console.log(` Already applied or invalid link: ${job.link}`);
//     continue;
//   }

//   try {
//     const jobPage = await browser.newPage();
//     await jobPage.goto(job.link, { waitUntil: 'domcontentloaded' });

//     await jobPage.waitForSelector('button.apply-button',{timeout:10000}).catch(()=>{});

//     const applyBtn = await jobPage.$('button.apply-button');
//     if (applyBtn) {
//       await applyBtn.click();
//       console.log(`applied to ${job.title} , ${job.link}`);
//       await jobPage.waitForTimeout(10000);
//       console.log(`applied to ${job.title}`);
      

//       const fillField = async (selector, value) => {
//         const field = await jobPage.$(selector);
//         if (field) {
//           await field.click({ clickCount: 3 });
//           await field.type(value);
//         }
//       };

//       await fillField('input[name*="currentCTC"]', config.currentCTC);
//       await fillField('input[name*="expectedCTC"]', config.expectedCTC);
//       await fillField('input[name*="notice"]', config.noticePeriod);
//       await fillField('textarea', config.projectSummary);

//       const submitBtn = await jobPage.$('button[type="submit"]');
//       if (submitBtn) {
//         await submitBtn.click();
//         console.log(` Applied: ${job.title} at ${job.company}`);
//       } else {
//         console.log(` Form not submitted manually: ${job.link}`);
//       }

//       applied.push(job);
//       fs.writeFileSync('./applied.json', JSON.stringify(applied, null, 2));
//     } else {
//       const externalLink = await jobPage.$eval('a[title*="Apply"]', a => a.href).catch(() => null);
//       if (externalLink) {
//         console.log(` External job (manual apply): ${externalLink}`);
//         applied.push({ ...job, externalLink });
//         fs.writeFileSync('./applied.json', JSON.stringify(applied, null, 2));
//       } else {
//         console.log(` No apply option found: ${job.link}`);
//       }
//     }

//     await jobPage.close();
//     await page.waitForTimeout(3000 + Math.random() * 2000);
//   } catch (err) {
//     console.log(` Error applying: ${job.link}`);
//   }
// }

// console.log("\uD83C\uDF1F All jobs processed. Closing browser.");
// await browser.close();

// } catch (err) { console.error("\u274C Unexpected Error:", err); } })();











// bot.js
const puppeteer = require('puppeteer');
const fs = require('fs'); 
let applied = [];

try {
   applied = JSON.parse(fs.readFileSync('./applied.json'));
} catch {
   applied = []
}
const config = require('./config.json');
const { promises } = require('dns');
// let applied = require('./applied.json');

(async () => { try { const browser = await puppeteer.launch({ headless: false, defaultViewport: null }); const page = await browser.newPage();

// Step 1: Go to Naukri login page
await page.goto('https://www.naukri.com/mnjuser/login', { waitUntil: 'domcontentloaded' });
console.log("\u23F3 Please login to Naukri manually (waiting 60 sec)...");
await new Promise(resolve => setTimeout(resolve, 10000)); // wait 60 sec for manual login

// Step 2: Navigate to job search page
// Step 2: Loop through multiple pages
const keyword = "nodejs developer";
const baseURL = `https://www.naukri.com/${keyword.replace(/ /g, '-')}-jobs`;

let allJobs = [];
const maxPages = 1; // You can increase to 10 or more

for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
  const pageURL = `${baseURL}-${pageNum}`;
  console.log(`🔍 Navigating to page ${pageNum}: ${pageURL}`);
  
  await page.goto(pageURL, { waitUntil: 'domcontentloaded' });
  await new Promise(res => setTimeout(res, 3000));

  try {
    await page.waitForSelector('.cust-job-tuple', { timeout: 3000 }); // changed
  } catch {
    console.log(`⚠️ No job tuples on page ${pageNum}. Stopping.`);
    break;
  }

  const jobs = await page.$$eval('.cust-job-tuple', tuples => {
    return tuples.map(tuple => {
      const link = tuple.querySelector('a.title')?.href || '';
      const title = tuple.querySelector('a.title')?.innerText.trim() || '';
      const company = tuple.querySelector('.comp-dtls-wrap a')?.innerText.trim() || '';
      return { title, company, link };
    });
  });

  console.log(`✅ Found ${jobs.length} jobs on page ${pageNum}`);
  allJobs.push(...jobs);

  await new Promise(res => setTimeout(res, 2000)); // wait before next page
}

console.log(`🎯 Total jobs collected across ${maxPages} pages: ${allJobs.length}`);

// Step 3: Wait for job listings
try {
   await page.waitForSelector('.cust-job-tuple', { timeout: 30000 });
   console.log("✅ Job listings loaded.");
 } catch (err) {
   await page.screenshot({ path: 'error.png', fullPage: true });
   console.log("❌ Job listings not found. Screenshot saved as error.png.");
   await browser.close();
   return;
 }
 
 // Step 4: Extract job info
 const jobs = await page.$$eval('.cust-job-tuple', tuples => {
   return tuples.map(tuple => {
     const link = tuple.querySelector('a.title')?.href || '';
     const title = tuple.querySelector('a.title')?.innerText.trim() || '';
     const company = tuple.querySelector('.comp-dtls-wrap a')?.innerText.trim() || '';
     return { title, company, link };
   });
 });
 
 console.log(`✅ Found ${jobs.length} job(s).`);


// Step 5: Loop through jobs
for (const job of allJobs) {
 if (!job.link || applied.find(j => j.link === job.link)) {
   console.log(` Already applied or invalid link: ${job.link}`);
   continue;
 }

 try {
   const jobPage = await browser.newPage();
   await jobPage.goto(job.link, { waitUntil: 'domcontentloaded' });

   await jobPage.waitForSelector('button.apply-button',{timeout:3000}).catch(()=>{}); // changed

   const applyBtn = await jobPage.$('button.apply-button');
   if (applyBtn) {
     await applyBtn.click();
     console.log(`applied to ${job.title} , ${job.link}`);
    //  await jobPage.waitForTimeout(10000);
    await jobPage.waitForSelector('div.chatbot_DrawerContentWrapper', { timeout: 15000 });
console.log('✅ Drawer form opened');
     console.log(`applied to ${job.title}`);



     const drawer = await jobPage.$('div.chatbot_DrawerContentWrapper');

if (drawer) {
    const fields = await jobPage.$$eval(
        'div.chatbot_DrawerContentWrapper input, div.chatbot_DrawerContentWrapper select, div.chatbot_DrawerContentWrapper textarea',
        elements => elements.map(el => ({
          tag: el.tagName,
          name: el.name,
          placeholder: el.placeholder,
          type: el.type,
          outerHTML: el.outerHTML
        }))
      );
      
      console.log("🧾 All fields in drawer:");
      fields.forEach(f => {
        console.log(`🔹 ${f.tag} | name: ${f.name} | placeholder: ${f.placeholder} | type: ${f.type}`);
      });
      const fillChatbotField = async (placeholderText, value) => {
        const fieldHandle = await drawer.$(`div[contenteditable="true"][data-placeholder="${placeholderText}"]`);
        if (fieldHandle) {
          await fieldHandle.focus();
          await fieldHandle.click({ clickCount: 3 });
          await fieldHandle.type(value.toString(), { delay: 50 });
          console.log(`✅ Filled: ${placeholderText}`);
        } else {
          console.log(`❌ Field not found: ${placeholderText}`);
        }
      };

      const chatbotFields = await drawer.$$(
        'div[contenteditable="true"][data-placeholder]'
      );
      
      for (const field of chatbotFields) {
        const placeholder = await field.evaluate(el => el.getAttribute('data-placeholder'));
        let value = '';
      
        if (placeholder.toLowerCase().includes('current ctc')) value = config.currentCTC;
        else if (placeholder.toLowerCase().includes('expected ctc')) value = config.expectedCTC;
        else if (placeholder.toLowerCase().includes('notice')) value = config.noticePeriod;
        else if (placeholder.toLowerCase().includes('project')) value = config.projectSummary;
        else if (placeholder.toLowerCase().includes('location')) value = config.currentLocation || "Hyderabad";
        else {
          console.log(`⚠️ Unknown field, skipping: ${placeholder}`);
          continue;
        }
      
        try {
          await field.click({ clickCount: 3 });
          await field.type(value.toString(), { delay: 50 });
          console.log(`✅ Filled: ${placeholder} with "${value}"`);
        } catch (e) {
          console.log(`❌ Failed to fill: ${placeholder}`);
        }
      }

  // Optional screenshot
//   await jobPage.screenshot({ path: `drawer_form_${Date.now()}.png, fullPage: true });

  // Click submit button inside drawer
  const saveBtn = await drawer.$('div.sendMsg');
  if (saveBtn) {
    console.log(`✅ Submitted: ${job.title} at ${job.company}`);
    await saveBtn.click();
    console.log(`✅ Submitted: ${job.title} at ${job.company}`);
    applied.push(job);
    fs.writeFileSync('./applied.json', JSON.stringify(applied, null, 2));
  } else {
    console.log(`❌ Submit button not found inside drawer for: ${job.title}`);
  }
} else {
  console.log("❌ Drawer not found after apply click");
}


     
     // Auto-fill form questions if they appear
// const questionsFilled = await jobPage.$$eval('form input, form select, form textarea', (fields, config) => {
//     fields.forEach(field => {
//       const name = field.name.toLowerCase();
      
//       if (name.includes('ctc') || name.includes('current')) {
//         field.value = config.currentCTC;
//       } else if (name.includes('expect')) {
//         field.value = config.expectedCTC;
//       } else if (name.includes('notice')) {
//         field.value = config.noticePeriod;
//       } else if (name.includes('angular')) {
//         field.value = '17'; // You can make this dynamic
//       } else if (field.tagName === 'TEXTAREA') {
//         field.value = config.projectSummary;
//       }
//     });
//     return true;
//   }, config);

     const fillField = async (selector, value) => {
       const field = await jobPage.$(selector);
       if (field) {
         await field.click({ clickCount: 3 });
         await field.type(value);
       }
     };

     await fillField('input[name*="currentCTC"]', config.currentCTC);
     await fillField('input[name*="expectedCTC"]', config.expectedCTC);
     await fillField('input[name*="notice"]', config.noticePeriod);
     await fillField('textarea', config.projectSummary);

     const submitBtn = await jobPage.$('button[type="submit"]');
     if (submitBtn) {
       await submitBtn.click();
       console.log(` Applied: ${job.title} at ${job.company}`);
     } else {
       console.log(` Form not submitted manually: ${job.link}`);
     }

     applied.push(job);
     fs.writeFileSync('./applied.json', JSON.stringify(applied, null, 2));
   } else {
     const externalLink = await jobPage.$eval('a[title*="Apply"]', a => a.href).catch(() => null);
     if (externalLink) {
       console.log(` External job (manual apply): ${externalLink}`);
       applied.push({ ...job, externalLink });
       fs.writeFileSync('./applied.json', JSON.stringify(applied, null, 2));
     } else {
       console.log(` No apply option found: ${job.link}`);
     }
   }

   await jobPage.close();
   await page.waitForTimeout(3000 + Math.random() * 2000);
 } catch (err) {
   console.log(` Error applying: ${job.link}`);
 }
}

console.log("\uD83C\uDF1F All jobs processed. Closing browser.");
await browser.close();

} catch (err) { console.error("\u274C Unexpected Error:", err); } })();