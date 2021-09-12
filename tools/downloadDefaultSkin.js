const request = require("superagent");
const fs = require("fs");
const AdmZip = require("adm-zip");

const source = "https://drive.google.com/uc?id=1ftm6PDXGoe1Q3dlyZgejC4nnWKI21ZXd&export=download";
const zipFile = "RewindDefaultSkin.zip";

request
  .get(source)
  .on("error", (error) => {
    console.log(error);
    process.exit(1);
  })
  .pipe(fs.createWriteStream(zipFile))
  .on("finish", () => {
    console.log("Finished downloading .zip file");
    const zip = new AdmZip(zipFile);
    console.log("Starting to unzip the skin");
    zip.extractAllTo("resources/Skins", false);
    console.log("Unzipped the skin");
    fs.rmSync(zipFile);
    console.log("Cleanup done");
  });
