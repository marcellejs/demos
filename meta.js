export default [
  {
    title: 'Machine Teaching with a Webcam',
    description:
      'This series of examples illustrates how to create interactive machine learning applications with Marcelle. End users can train an image classifier in the browser from their own images captured with a webcam.',
    demos: [
      {
        name: 'Dashboard',
        path: 'webcam-dashboard',
        description: 'Simple dashboard for training an image classifier from the webcam',
        glitch: 'https://glitch.com/edit/#!/remix/marcelle-v2-dashboard',
      },
      {
        name: 'MLP vs KNN',
        path: 'webcam-mlp-vs-knn',
        description: 'Dashboard for comparing image classification models interactively',
        glitch: 'https://glitch.com/edit/#!/remix/marcelle-v2-mlp-vs-knn',
      },
      {
        name: 'Move2Music',
        path: 'webcam-move2music',
        description: 'Control music playback from webcam-based image recognition',
        glitch: 'https://glitch.com/edit/#!/remix/marcelle-v2-move2audio',
      },
    ],
  },
  {
    title: 'Machine Teaching with Sketches',
    demos: [
      {
        name: 'Simple Prototype',
        path: 'sketch-simple',
        description: 'An initial prototype for training a sketch classifier',
        glitch: 'https://glitch.com/edit/#!/remix/marcelle-uist2021-sketch-v1',
      },
      {
        name: 'Detailed Dashboard',
        path: 'sketch-detailed',
        description: 'A variation of the initial prototype, with a more detailed dashboard',
        glitch: 'https://glitch.com/edit/#!/remix/marcelle-uist2021-sketch-v1b',
      },
      {
        name: 'Online Learning',
        path: 'sketch-online',
        description: 'A version of the application with an improved workflow using online learning',
        glitch: 'https://glitch.com/edit/#!/remix/marcelle-uist2021-sketch-v2',
      },
    ],
  },
  {
    title: 'Other Tasks',
    demos: [
      {
        name: 'Object Detection',
        path: 'object-detection',
        description: 'Object detection using COCO-SSD',
      },
      {
        name: 'K-Means Clustering',
        path: 'kmeans-clustering',
        description: 'K-Means clustering on Mobilenet Features',
      },
    ],
  },
  {
    title: 'Working with CSV',
    demos: [
      {
        name: 'IRIS',
        path: 'iris',
        description: 'Simple classification on the IRIS dataset with interactive prediction',
      },
    ],
  },
  {
    title: 'Custom Components',
    demos: [
      {
        name: 'UMAP',
        path: 'umap',
        description: 'Custom component implementing dataset visualization with UMAP',
      },
    ],
  },
  {
    title: 'Misc',
    demos: [
      {
        name: 'Mobilenet Tetris',
        path: 'mobilenet-tetris',
        description: 'A tetris game controlled from your webcam using image classification',
      },
    ],
  },
  //  {
  //   "name": "Wizard",
  //   "path": "wizard",
  //   "description": "Training wizard for training an image classifier from the webcam"
  // }, {
  //   "name": "Sketch",
  //   "path": "sketch",
  //   "description": "Incremental teaching workflow for sketch classification"
  // }, {
  //   "name": "Object Detection with COCO-SSD",
  //   "path": "object-detection",
  //   "description": "Simple object detection pipeline from single images"
  // }
];
