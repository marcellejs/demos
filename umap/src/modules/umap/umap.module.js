import { Module, Stream } from '@marcellejs/core';
import { UMAP } from 'umap-js';
import Component from './umap.svelte';

export class Umap extends Module {
  constructor(dataset, supervised = false) {
    super();
    this.$embedding = new Stream([], true);
    this.$labels = new Stream([], true);
    this.title = 'umap';
    this.supervised = supervised;
    this.dataset = dataset;
    this.start();
  }

  async render() {
    const instances = await this.dataset.instanceService.find({
      query: { $select: ['features', 'label'] },
    });
    const umapData = instances.data.reduce((d, x) => d.concat([x.features[0]]), []);
    const labels = instances.data.map((x) => x.label);
    this.$labels.set(labels);
    const umap = new UMAP({ nComponents: 2 });
    if (this.supervised) {
      umap.setSupervisedProjection(labels);
    }
    const embedding = await umap.fitAsync(umapData, () => {
      this.$embedding.set(umap.getEmbedding());
    });
    this.$embedding.set(embedding);
  }

  mount(targetSelector) {
    const target = document.querySelector(targetSelector || `#${this.id}`);
    if (!target) return;
    this.destroy();
    this.$$.app = new Component({
      target,
      props: {
        title: this.name,
        embedding: this.$embedding,
        labels: this.$labels,
      },
    });
  }
}
