const BayesClassifier = require('bayes-classifier');

const classifier = new BayesClassifier();
const readfiles = require('node-readfiles');
const iqr = require('compute-iqr');
const stats = require('stats-analysis');
const esprima = require('esprima');

const globalConcernValues = {};
const globalConcernThreshold = {};
const globalConcerns = [];
let JSFiles = 0;
const smellsIQR = {};
const smellsMAD = {};

function writeFile(path, contents, cb) {
  mkdirp(getDirName(path), (err) => {
		if (err) return cb(err);

		fs.writeFile(path, contents, cb);
	});
}

function getLength(x) {
  let count = 0;
  for (let key in x) {
    if (x.hasOwnProperty(key))
      {count++;}
  }
  return count++;
}

function updateConcerns(root) {
  if (root.isFile) {
    root.concerns = classifier.getClassifications(root.content);
    for (var i = 0; i < root.concerns.length; i++) {
      globalConcernValues.push(root.concerns[i].value);
    }
    return;
  }
  if (root.isDir) {
    for (var i = 0; i < root.children.length; i++) {
      updateConcerns(root.children[i]);
    }
  }
}

function startClassification(path, root) {
  readfiles(path, {}, (err, filename, content) => {
    const folder = filename.split('/')[0];
    classifier.addDocument(content.toString(), folder.toString());
  }).then((files) => {
    console.log(`Read ${files.length } training file(s)`);
    classifier.train();
    console.log('Classifier tranied');

    const inputPath = 'test';
    readfiles(`./input/${inputPath}/`, {}, (err, filename, content) => {
      console.log(`File ${  filename  }:`);
      if (err) {
        console.error(err)
      }

      if (!err && filename.toString().indexOf('.js') === filename.toString().length - 3) {
        JSFiles++;
        try {
          esprima.parse(content, {
            sourceType: 'module',
          });
        } catch (err) {
          return;
        }
        let cs = classifier.getClassifications(content);
        globalConcerns.push({
          file: filename,
          concerns: cs,
        });
        for (let i = 0; i < cs.length; i++)
          {if (globalConcernValues[cs[i].label])
						globalConcernValues[cs[i].label].push(cs[i].value);
					else {
						globalConcernValues[cs[i].label] = [];
						globalConcernValues[cs[i].label].push(cs[i].value);
					}}
      }
    }).then((files) => {
      console.log(`Read ${  files.length  } project file(s)`);
      for (let key in globalConcernValues) {
        globalConcernThreshold[key] = {
          iqr: 1.5 * iqr(globalConcernValues[key]),
          mad: 2 * stats.MAD(globalConcernValues[key]),
        };
      }
      console.log(globalConcernThreshold);
      for (let i = 0; i < globalConcerns.length; i++) {
        for (let j = 0; j < globalConcerns[i].concerns.length; j++) {
          if (globalConcerns[i].concerns[j].value > globalConcernThreshold[globalConcerns[i].concerns[j].label].iqr) {
            if (smellsIQR[globalConcerns[i].concerns[j].label])
              {smellsIQR[globalConcerns[i].concerns[j].label].push(globalConcerns[i].file)};
            else {
              smellsIQR[globalConcerns[i].concerns[j].label] = [];
              smellsIQR[globalConcerns[i].concerns[j].label].push(globalConcerns[i].file);
            }
          }

          if (globalConcerns[i].concerns[j].value > globalConcernThreshold[globalConcerns[i].concerns[j].label].mad) {
            if (smellsMAD[globalConcerns[i].concerns[j].label])
              {smellsMAD[globalConcerns[i].concerns[j].label].push(globalConcerns[i].file)};
            else {
              smellsMAD[globalConcerns[i].concerns[j].label] = [];
              smellsMAD[globalConcerns[i].concerns[j].label].push(globalConcerns[i].file);
            }
          }
        }
      }
      console.log('IQR smells: ---------------------------------------------------------------------------');
      console.log(smellsIQR);
      console.log('IQR smells: ---------------------------------------------------------------------------');
      console.log('');
      console.log('');
      console.log('');
      console.log('MAD smells: ---------------------------------------------------------------------------');
      console.log(smellsMAD);
      console.log('MAD smells: ---------------------------------------------------------------------------');
    }).catch((err) => {
      console.log('Error reading files:', err.message);
    });

    const IQRValue = 1.5 * iqr(globalConcernValues);
    const MADValue = 2 * stats.MAD(globalConcernValues);

    console.log(`IQRValue: ${  IQRValue}`);
    console.log(`MADValue: ${  MADValue}`);
  }).catch((err) => {
    console.log('Error reading files:', err.message);
  });
}


if (!(process.argv[2])) {
  console.log('Please specify an appropriate input path');
} else
if (!process.argv[2].length) {
  console.log('Please specify an appropriate input path');
} else {
  startClassification('./skv_concerns/');
}
