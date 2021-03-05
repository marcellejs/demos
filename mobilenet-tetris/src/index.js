import '@marcellejs/core/dist/marcelle.css';
import './style.css';
import {
  datasetBrowser,
  dataset,
  button,
  parameters,
  trainingProgress,
  toggle,
  dataStore,
  dashboard,
  textfield,
  batchPrediction,
  confusionMatrix,
  classificationPlot,
  select,
  mobilenet,
  webcam,
  knn,
} from '@marcellejs/core';
import { setMove, reset, stop } from './tetris';
import App from './App.svelte';

// -----------------------------------------------------------
// INPUT PIPELINE & DATA CAPTURE
// -----------------------------------------------------------

const input = webcam();
const featureExtractor = mobilenet();

const label = textfield();
label.title = 'Instance label';
const capture = button({ text: 'Hold to record instances' });
capture.title = 'Capture instances to the training set';

let recording = false;
const instances = input.$images
  .filter(() => capture.$down.value || recording)
  .map(async (img) => ({
    type: 'image',
    data: img,
    label: label.$text.value,
    thumbnail: input.$thumbnails.value,
    features: await featureExtractor.process(img),
  }))
  .awaitPromises();

const store = dataStore({ location: 'localStorage' });
const trainingSet = dataset({ name: 'TrainingSet-mobilenet-tetris', dataStore: store });

trainingSet.capture(instances);

const trainingSetBrowser = datasetBrowser(trainingSet);

// -----------------------------------------------------------
// TRAINING
// -----------------------------------------------------------

const trainingLauncher = button({ text: 'Train' });
trainingLauncher.title = 'Training Launcher';
const classifier = knn({ dataStore: store });
classifier.sync('mobilenet-tetris-classifier');
trainingLauncher.$click.subscribe(() => classifier.train(trainingSet));

const params = parameters(classifier);
const prog = trainingProgress(classifier);

// -----------------------------------------------------------
// BATCH PREDICTION
// -----------------------------------------------------------

const batchMLP = batchPrediction({ name: 'mlp', dataStore: store });
const confMat = confusionMatrix(batchMLP);

const predictButton = button({ text: 'Update predictions' });
predictButton.$click.subscribe(async () => {
  await batchMLP.clear();
  await batchMLP.predict(classifier, trainingSet);
});

// -----------------------------------------------------------
// REAL-TIME PREDICTION
// -----------------------------------------------------------

const tog = toggle({ text: 'toggle prediction' });

const predictionStream = input.$images
  .filter(() => tog.$checked.value)
  .map(async (img) => classifier.predict(await featureExtractor.process(img)))
  .awaitPromises();

// const predictedLabel = predictionStream.throttle(200).map((x) => x.label);
const predictedLabel = predictionStream.map((x) => x.label).skipRepeats();
predictedLabel.subscribe((x) => {
  setMove(x);
});

const plotResults = classificationPlot(predictionStream);

// -----------------------------------------------------------
// DASHBOARDS
// -----------------------------------------------------------

const dash = dashboard({
  title: 'Marcelle Example - Dashboard',
  author: 'Marcelle Pirates Crew',
});

dash.page('Data Management').useLeft(input).use([label, capture], trainingSetBrowser);
dash.page('Training').use(params, trainingLauncher, prog);
dash.page('Batch Prediction').use(predictButton, confMat);
dash.page('Real-time Prediction').useLeft(input).use(tog, plotResults);
dash.settings.use(trainingSet);

let playing = false;
const playButton = document.querySelector('#play');
playButton.addEventListener('click', () => {
  playButton.classList.toggle('danger');
  if (playing) {
    tog.$checked.set(false);
    playButton.innerHTML = 'Play!';
    stop();
  } else {
    playButton.innerHTML = 'Stop!';
    tog.$checked.set(true);
    reset();
  }
  playing = !playing;
});

const sel = select({
  options: [
    'idle',
    'left',
    'right',
    'soft-drop',
    'hard-drop',
    'rotate-clockwise',
    'rotate-counterclockwise ',
  ],
});
sel.$value.subscribe((x) => label.$text.set(x));

const app = new App({
  target: document.querySelector('#tetris-controls'),
  props: {
    input,
    sel,
    browser: trainingSetBrowser,
    predictedLabel,
  },
});

app.$on('clearDataset', () => {
  trainingSet.clear();
});

app.$on('recording', (value) => {
  recording = value.detail;
  if (!value.detail) {
    classifier.train(trainingSet);
  }
});
