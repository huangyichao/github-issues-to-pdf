function sleep(delay) {
    for (var t = Date.now(); Date.now() - t <= delay;);
}

//EMBEDED LIBRARIES
const readline = require("readline");
const puppeteer = require('puppeteer');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const username='XXX';
const passwd='XXX';
const org='XXX';

const options = process.argv;
let issuenum;
let reponame;
if(options && options.length > 3){
  reponame=options[2]; // 仓库名
  issuenum=options[3]; //issue总数
}
else {
  reponame='testtool';
  issuenum=1
}


/*
Waiting all TotalJS configurations be ready 
*/
/*
Function to askToken from user
*/
function askToken(questionText) {
  console.log("[Token] - Asking token from user input");
  return new Promise((resolve, reject) => {
    rl.question("\nWhat is the token received?", (input) => {
    rl.close();
    resolve(input);
    });
  });
}

/*
Lauching Puppeter to get page and send Token
*/
puppeteer.launch().then(async browser => {
const page = await browser.newPage();
// Set screen size
  await page.setViewport({width: 1920, height: 1080});
  await page.setUserAgent( 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36');
  console.log("[Browser] - Opening");
  await page.goto('https://github.com/login');
  await page.type('#login_field', username);   // 填写用户名
  await page.type('#password', passwd);   // 填写密码
  await page.click('[name="commit"]');   // 提交表单
  console.log("[Browser] - Page is open and start operations to take token");
  const token = await askToken();
  console.log("\n[Token] - configured token is: "+token);
  console.log("[Browser] - KeepGoing with alredy configured token");
/*
USE HERE YOUR ALREDY CONFIGURED GLOBAL TOKEN TO CONTINUE
YOUR CODE EXECUTION
*/
   await page.type('#app_totp', token);   // 填写token
   await page.click('[type="submit"]');   // 提交表单
		console.log("[Browser] - Closing");

  for (var i = 1;i<=issuenum;i++){
    const url=`https://github.com/${org}/${reponame}/issues/${i}`
    const pdfname=`out/issue${i}.pdf`
    await page.goto(url, {
      timeout: 300 * 1000,
      waitUntil: [
        //  'load',              //等待 “load” 事件触发
        // 'domcontentloaded',  //等待 “domcontentloaded” 事件触发
        'networkidle0',      //在 500ms 内没有任何网络连接
        //  'networkidle2'       //在 500ms 内网络连接个数不超过 2 个
      ]
    });
    //由于是基于 chrome 浏览器的，浏览器为了打印节省油墨，默认是不导出背景图及背景色的
    await page.pdf({path: pdfname, format: 'A3',printBackground:true,margin:{top:20,bottom:20}});
    console.log(`issue path is : ${url}, pdf is ${pdfname}`)
  }
  await browser.close();
});
