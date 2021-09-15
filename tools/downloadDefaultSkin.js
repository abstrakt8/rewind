const request = require("superagent");
const fs = require("fs");
const AdmZip = require("adm-zip");

const sources = [
  {
    url: "https://drive.google.com/uc?id=1tNHWSBlfNZp2h1C_LRyjddRd9AZhJj6p&export=download",
    name: "OsuDefaultSkin",
  },
  {
    url: "https://drive.google.com/uc?id=1ftm6PDXGoe1Q3dlyZgejC4nnWKI21ZXd&export=download",
    name: "RewindDefaultSkin",
  },
];

for (const source of sources) {
  const { url, name } = source;
  const zipFileName = `${name}.zip`;
  request
    .get(url)
    .on("error", (error) => {
      console.log(`Error downloading ${name}: ` + error);
      process.exit(1);
    })
    .pipe(fs.createWriteStream(zipFileName))
    .on("finish", () => {
      console.log("Finished downloading .zip file");
      const zip = new AdmZip(zipFileName);
      console.log("Starting to unzip the skin");
      zip.extractAllTo("resources/Skins", false);
      console.log("Unzipped the skin");
      fs.rmSync(zipFileName);
      console.log("Cleanup done");
    });
}
