// Name of Playlist : Pepcoding Level 1,view
// Total No of videos : 575
// actual No of videos :574
// Average length of video : 6 minutes, 46 seconds
// Total length of playlist : 2 days, 8 hours, 29 minutes, 15 seconds
// At 1.25x : 1 day, 21 hours, 11 minutes, 24 seconds
// At 1.50x : 1 day, 13 hours, 39 minutes, 30 seconds
// At 1.75x : 1 day, 8 hours, 16 minutes, 42 seconds
// At 2.00x : 1 day, 4 hours, 14 minutes, 37 seconds
//  console.table of video number,name,time

const pdfkit = require('pdfkit');
const puppeteer = require("puppeteer");
let fs = require('fs');
let path = require('path');
let page;
(async function fn() {
    let browser = await puppeteer.launch({
        headless: false, defaultViewport: null,
        args: ["--start-fullscreen", '--window-size=1920,1040',"--disable-notifications"],
    })
    page = await browser.newPage();
    await page.goto("https://www.youtube.com/playlist?list=PL-Jc9J83PIiFj7YSPl2ulcpwy-mwj1SSk");
    //
    // await page.goto(url);
    await page.waitForSelector("h1[id='title']");
    let titleElement = await page.$("h1[id='title']");
    let title = await page.evaluate(txtElem,titleElement);
    console.log('Name of the Playlist : Pepcoding '+title);
    let statElementArr = await page.$$("#stats .style-scope.ytd-playlist-sidebar-primary-info-renderer");
    let videoCount = await page.evaluate(txtElem,statElementArr[0]);
    let viewsCount = await page.evaluate(txtElem,statElementArr[1]);
    console.log("Total Videos of the playList : "+videoCount);
    console.log("Total Views Till Now : "+viewsCount);

    let videos = videoCount.split(" ")[0].trim();
    // console.log("Total no of videos : "+videos);
    let loopcount = Math.floor(videos / 100);
    // console.log(loopcount);

    for (let i = 0; i < loopcount; i++) {
        // load start
        await page.click(".circle.style-scope.tp-yt-paper-spinner");
        // load finish
        await waitTillHTMLRendered(page);
        // console.log("loaded the new videos");
    }

    let videoNameElementList = await page.$$("a[id='video-title']");
    // console.log("videoNameElementList", videoNameElementList.length);
    // last video 
    let lastVideo = videoNameElementList[videoNameElementList.length - 1];
    // last video -> view
    await page.evaluate(function (elem) {
        elem.scrollIntoView();
    }, lastVideo);

    let timeList = await page.$$("span[id='text']");
    // console.log("Actual Number of videos : "+timeList.length);
    console.log("Actual Number of videos : "+videoNameElementList.length);

    let videosArr = [];
    let timeInSecs = 0;
    //console.log(timeList);
    for (let i = 0; i < timeList.length; i++) {
        let timeNTitleObj = await page.evaluate(getTimeAndTitle, timeList[i], videoNameElementList[i]);
        videosArr.push(timeNTitleObj);

        let k = timeNTitleObj.time.includes(":");
        // console.log(k);
        if(k == true) {
            let timePartArr = timeNTitleObj.time.split(":");
        // console.log(timePart[0]+"----"+timePart[1]);
        // console.log(timePartArr.length);
            if(timePartArr.length == 3){
                timeInSecs += Number(timePartArr[0])*3600+Number(timePartArr[1])*60+Number(timePartArr[2]);  
              }else{
                timeInSecs += Number(timePartArr[0])*60+Number(timePartArr[1]);
                
              } 
        }else{
            timeInSecs += 0;
        }
    }

    // console.log(timeInSecs);
    // let time = 203355;
    // console.table(videosArr);
    console.log("Total length of playlist : ");    
    totalLength(timeInSecs);
    console.log("------------------------------------");
    console.log("Total length of playlist At 1.25x : ");
    playing1_25(timeInSecs);
    console.log("------------------------------------");
    console.log("Total length of playlist At 1.5x :");
    playing1_5(timeInSecs);
    console.log("------------------------------------");
    console.log("Total length of playlist At 1.75x :");
    playing1_75(timeInSecs);
    console.log("------------------------------------");
    console.log("Total length of playlist At 2x :");
    playing2(timeInSecs);
    console.log("------------------------------------");
    let avgTime = Math.floor(timeInSecs/videoNameElementList.length);
    console.log("Average length of video : ");
    totalLength(avgTime);
    console.log("------------------------------------");

    let folderPath = path.join(__dirname,"PepCoding");
    isDirrectory(folderPath);
    let filePath = path.join(folderPath,"Level_1_Playlist"+".pdf");
    let text =  JSON.stringify(videosArr);
    let pdfDoc = new pdfkit();
    pdfDoc.pipe(fs.createWriteStream(filePath));
    pdfDoc.text(text);
    pdfDoc.end();

})();

function txtElem(element){
    return element.textContent.trim();
}

function getTimeAndTitle(element1, element2) {
    return {
        time:  element1.textContent.trim(),
        title: element2.textContent.trim()
    }
}

const waitTillHTMLRendered = async (page, timeout = 10000) => {
    const checkDurationMsecs = 1000;
    const maxChecks = timeout / checkDurationMsecs;
    let lastHTMLSize = 0;
    let checkCounts = 1;
    let countStableSizeIterations = 0;
    const minStableSizeIterations = 3;

    while (checkCounts++ <= maxChecks) {
        let html = await page.content();
        let currentHTMLSize = html.length;
        let bodyHTMLSize = await page.evaluate(() => document.body.innerHTML.length);
        // console.log('last: ', lastHTMLSize, ' <> curr: ', currentHTMLSize, " body html size: ", bodyHTMLSize);
        if (lastHTMLSize != 0 && currentHTMLSize == lastHTMLSize)
            countStableSizeIterations++;
        else
            countStableSizeIterations = 0; //reset the counter

        if (countStableSizeIterations >= minStableSizeIterations) {
            // console.log("Page rendered fully..");
            break;
        }
        lastHTMLSize = currentHTMLSize;
        await page.waitForTimeout(checkDurationMsecs);
    }
}

function totalLength(timeInSecs){
    
    let secs = timeInSecs % 60;
    let totalMin = Math.floor(timeInSecs/60);
    let min = totalMin % 60;
    let tothrs = Math.floor(totalMin/60);
    let hrs = tothrs%24;
    let days = Math.floor(tothrs/24);
    // console.log(secs);
    // console.log(totalMin);
    // console.log(min);
    // console.log(hrs);
    console.log(days+" Days "+hrs+" hours "+min+" minutes "+secs+" seconds");
}

function playing1_25(timeInSecs){
    let timeIn1_25 = Math.floor(timeInSecs /1.25)
    totalLength(timeIn1_25);
}

function playing1_5(timeInSecs){
    let timeIn1_5 = Math.floor(timeInSecs/1.5); 
    
    totalLength(timeIn1_5);
}

function playing1_75(timeInSecs){
    let timeIn1_75 = Math.floor(timeInSecs/1.75); 
    
    totalLength(timeIn1_75);
}

function playing2(timeInSecs){
    let timeIn2 = Math.floor(timeInSecs/2); 
    
    totalLength(timeIn2);
}

function isDirrectory(folderPath) {
    if(fs.existsSync(folderPath)== false){
        fs.mkdirSync(folderPath);
    }
}

