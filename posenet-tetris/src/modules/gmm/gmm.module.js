import { Module, Stream } from '@marcellejs/core';
import { TrainingSet, trainMulticlassGMM, MulticlassGMMPredictor } from 'xmmjs';

export class Gmm extends Module {
  constructor({ gaussians = 3 } = {}) {
    super();
    this.name = 'gmm';
    this.description = 'TODO: Gmm description';
    this.parameters = {
      gaussians: new Stream(gaussians, true),
    };
    this.$training = new Stream({ status: 'idle' });
    this.start();
  }

  train(dataset) {
    this.labels = dataset.$labels.value || [];
    this.$training.set({ status: 'start', epochs: 1 });
    setTimeout(async () => {
      const ts = await this.createTrainingSet(dataset);
      if (ts) {
        this.trainGMM(ts);
        this.$training.set({ status: 'success', epoch: 1, epochs: 1 });
      } else {
        this.$training.set({ status: 'error', epoch: 1, epochs: 1 });
      }
    }, 100);
  }

  // eslint-disable-next-line class-methods-use-this
  async createTrainingSet(dataset) {
    const classes = dataset.$classes.value;
    const { data, total } = await dataset.instanceService.find({
      query: { $select: ['id', 'features'] },
    });
    if (total === 0) return null;
    const ts = TrainingSet({ inputDimension: data[0].features[0].length });
    Object.entries(classes).forEach(([label, ids], i) => {
      const phrase = ts.push(i, label);
      ids.forEach((id) => {
        const feats = data.filter((x) => x.id === id)[0].features[0];
        phrase.push(feats);
      });
    });
    return ts;
  }

  trainGMM(ts) {
    // Train the GMM with the given configuration
    const configuration = {
      gaussians: this.parameters.gaussians.value,
      regularization: {
        absolute: 1e-3,
        relative: 1e-1,
      },
      covarianceMode: 'full',
    };
    const gmmParams = trainMulticlassGMM(ts, configuration);
    this.predictor = MulticlassGMMPredictor(gmmParams);
    this.reset();
  }

  reset() {
    this.predictor.reset();
  }

  async predict(frame) {
    if (!this.predictor) return {};
    try {
      this.predictor.predict(frame[0]);
      const res = this.predictor.results;
      return {
        label: res.likeliest,
        confidences: res.smoothedNormalizedLikelihoods.reduce(
          (a, x, i) => ({ ...a, [res.labels[i]]: x }),
          {},
        ),
      };
    } catch (error) {
      return {};
    }
  }
}
