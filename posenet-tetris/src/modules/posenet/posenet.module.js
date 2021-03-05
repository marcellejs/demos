import { Module, Stream, toggle, webcam } from '@marcellejs/core';
import { load as loadPosenet } from '@tensorflow-models/posenet';
import Component from './posenet.svelte';

const partOrder = [
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

export class Posenet extends Module {
  constructor({ joints = partOrder } = {}) {
    super();
    this.tile = 'posenet';
    this.webcam = webcam({ width: 400, height: 300 });
    this.toggle = toggle({ text: 'Activate' });
    this.toggle.title = '';
    this.toggle.$checked.subscribe((c) => {
      this.webcam.$active.set(c);
    });
    this.$loading = new Stream(true, true);
    this.$bodyParts = new Stream(joints, true);
    this.$bodyParts.subscribe((jointList) => {
      this.partIndices = jointList.map((x) => partOrder.indexOf(x));
    });
    this.$joints = new Stream([]);
    this.$thumbnails = this.webcam.$thumbnails;
    this.$poses = new Stream([], true);
    this.start();
    this.setup();
  }

  async setup() {
    navigator.getUserMedia =
      navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    // this.posenet = await loadPosenet({
    //   architecture: 'MobileNetV1',
    //   outputStride: 16,
    //   inputResolution: { width: 400, height: 300 },
    //   multiplier: 0.75,
    // });
    this.posenet = await loadPosenet({
      architecture: 'ResNet50',
      outputStride: 32,
      inputResolution: { width: 257, height: 200 },
      quantBytes: 2,
    });
    this.webcam.$images.throttle(100).subscribe((img) => this.process(img));
    this.$loading.set(false);
  }

  async process(img) {
    try {
      const poses = await this.posenet.estimatePoses(img, {
        flipHorizontal: true,
        decodingMethod: 'single-person',
      });
      this.$poses.set(poses);
      const jointPositions = this.partIndices
        .map((x) => {
          const p = poses[0].keypoints[x].position;
          return [p.x / 400, p.y / 300];
        })
        .reduce((x, y) => x.concat(y), []);
      this.$joints.set([jointPositions]);
    } catch (error) {
      if (img) {
        console.log('error', error);
      }
    }
    // console.log('poses', poses);
  }

  mount(t) {
    const target = t || document.querySelector(`#${this.id}`);
    if (!target) return;
    this.destroy();
    this.$$.app = new Component({
      target,
      props: {
        title: this.name,
        loading: this.$loading,
        mediastream: this.webcam.$mediastream,
        poses: this.$poses,
        toggle: this.toggle,
        bodyParts: this.$bodyParts,
      },
    });
  }
}
