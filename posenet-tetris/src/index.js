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
  trainingPlot,
  batchPrediction,
  confusionMatrix,
  classificationPlot,
  select,
} from '@marcellejs/core';
import { gmm, posenet } from './modules';
import { setMove, reset, stop } from './tetris';
import App from './App.svelte';

// -----------------------------------------------------------
// INPUT PIPELINE & DATA CAPTURE
// -----------------------------------------------------------

const input = posenet({ joints: ['leftEye', 'rightEye'] });

const label = textfield();
label.title = 'Instance label';
const capture = button({ text: 'Hold to record instances' });
capture.title = 'Capture instances to the training set';

let recording = false;
const instances = input.$joints
  .filter(() => capture.$down.value || recording)
  .map(async (joints) => ({
    type: 'image',
    label: label.$text.value,
    thumbnail: input.$thumbnails.value,
    features: joints,
  }))
  .awaitPromises();

const store = dataStore({ location: 'localStorage' });
const trainingSet = dataset({ name: 'TrainingSet-Posenet-tetris', dataStore: store });
trainingSet.capture(instances);

const trainingSetBrowser = datasetBrowser(trainingSet);

// -----------------------------------------------------------
// TRAINING
// -----------------------------------------------------------

const trainingLauncher = button({ text: 'Train' });
trainingLauncher.title = 'Training Launcher';
const classifier = gmm({ gaussians: 3 });
trainingLauncher.$click.subscribe(() => classifier.train(trainingSet));

const params = parameters(classifier);
const prog = trainingProgress(classifier);
const plotTraining = trainingPlot(classifier);

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
tog.$checked.subscribe((x) => {
  if (x) classifier.reset();
});

const predictionStream = input.$joints
  .filter(() => tog.$checked.value)
  .map(async (joints) => classifier.predict(joints))
  .awaitPromises();

// const predictedLabel = predictionStream.throttle(500).map((x) => x.label);
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
dash.page('Training').use(params, trainingLauncher, prog, plotTraining);
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

const selectFeatures = select({
  options: ['full-body', 'hands', 'eyes', 'trunk'],
  value: 'full-body',
});
selectFeatures.$value.subscribe((value) => {
  let bodyParts;
  if (value === 'eyes') {
    bodyParts = ['leftEye', 'rightEye'];
  } else if (value === 'hands') {
    bodyParts = ['leftWrist', 'rightWrist'];
  } else if (value === 'trunk') {
    bodyParts = ['nose', 'leftHip', 'rightHip'];
  } else {
    bodyParts = [
      'nose',
      'leftEye',
      'rightEye',
      'leftEar',
      'rightEar',
      'leftShoulder',
      'rightShoulder',
      'leftElbow',
      'rightElbow',
      'leftWrist',
      'rightWrist',
      'leftHip',
      'rightHip',
      'leftKnee',
      'rightKnee',
      'leftAnkle',
      'rightAnkle',
    ];
  }
  input.$bodyParts.set(bodyParts);
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
    selectFeatures,
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

setTimeout(() => {
  if (trainingSet.$count.value > 0) {
    classifier.train(trainingSet);
  }
}, 2000);
