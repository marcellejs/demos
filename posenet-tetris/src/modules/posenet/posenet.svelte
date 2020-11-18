<script>
  import { ModuleBase } from '@marcellejs/core';
  import { onDestroy, onMount } from 'svelte';
  import { drawKeypoints, drawSkeleton } from './utils';

  export let title;
  export let loading;
  export let mediastream;
  export let poses;
  export let toggle;
  export let bodyParts;

  let videoElement;

  async function waitForElement(elt) {
    return new Promise((resolve) => {
      if (elt) return resolve();
      const x = setInterval(() => {
        if (elt) {
          clearInterval(x);
          resolve();
        }
      }, 100);
    });
  }

  let ctx;
  let canvasElement;
  onMount(async () => {
    await waitForElement(videoElement);
    await waitForElement(canvasElement);
    toggle.mount();
    mediastream.subscribe((stream) => {
      if (videoElement && stream) {
        videoElement.srcObject = stream;
      }
    });
    ctx = canvasElement.getContext('2d');
    canvasElement.width = 400;
    canvasElement.height = 300;
    poses.subscribe((p) => {
      // canvasElement.width = videoElement.clientWidth;
      // canvasElement.height = videoElement.clientHeight;
      ctx.clearRect(0, 0, 400, 300);

      // ctx.save();
      // ctx.scale(-1, 1);
      // ctx.translate(-videoWidth, 0);
      // ctx.drawImage(videoElement, 0, 0, videoWidth, videoHeight);
      // ctx.restore();
      p.forEach(({ score, keypoints }) => {
        const minPoseConfidence = 0.1;
        const minPartConfidence = 0.5;
        if (score >= minPoseConfidence) {
          const k = keypoints.filter(({ part }) => bodyParts.value.includes(part));
          drawKeypoints(k, minPartConfidence, ctx);
          try {
            drawSkeleton(k, minPartConfidence, ctx);
          } catch (error) {
            // no
          }
        }
      });
    });
  });

  onDestroy(() => {
    toggle.destroy();
  });
</script>

<style>
  video {
    transform: scaleX(-1);
    min-height: 300px;
    background-color: lightgray;
  }

  #posenet-output {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    max-width: 100%;
  }
</style>

<svelte:options accessors />

<ModuleBase {title} loading={$loading}>
  <div style="margin-left: 10px;">
    <div id={toggle.id} />
  </div>
  <div style="position: relative">
    <video id="posenet-video" bind:this={videoElement} autoplay muted playsinline />
    <canvas id="posenet-output" bind:this={canvasElement} />
  </div>
</ModuleBase>
