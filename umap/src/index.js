import '@marcellejs/core/dist/marcelle.css';
import {
  datasetBrowser,
  webcam,
  mobilenet,
  dataset,
  button,
  dataStore,
  dashboard,
  textfield,
} from '@marcellejs/core';
import { umap } from './modules';

// -----------------------------------------------------------
// INPUT PIPELINE & DATA CAPTURE
// -----------------------------------------------------------

const input = webcam();
const featureExtractor = mobilenet();

const label = textfield();
label.title = 'Instance label';
const capture = button({ text: 'Hold to record instances' });
capture.title = 'Capture instances to the training set';

const instances = input.$images
  .filter(() => capture.$down.value)
  .map(async (img) => ({
    type: 'image',
    data: img,
    label: label.$text.value,
    thumbnail: input.$thumbnails.value,
    features: await featureExtractor.process(img),
  }))
  .awaitPromises();

const store = dataStore({ location: 'localStorage' });
const trainingSet = dataset({ name: 'TrainingSet-umap', dataStore: store });
trainingSet.capture(instances);

const trainingSetBrowser = datasetBrowser(trainingSet);

const trainingSetUMap = umap(trainingSet);

const updateUMap = button({ text: 'Update Visualization' });
updateUMap.$click.subscribe(() => {
  trainingSetUMap.render();
});

// -----------------------------------------------------------
// DASHBOARDS
// -----------------------------------------------------------

const dash = dashboard({
  title: 'Marcelle Example - Custom UMAP Module',
  author: 'Marcelle Pirates Crew',
});

dash
  .page('Main')
  .useLeft(input, featureExtractor)
  .use([label, capture], trainingSetBrowser, updateUMap, trainingSetUMap);
dash.settings.use(trainingSet);

dash.start();
