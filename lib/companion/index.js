import { CompanionState } from './state.js';
import { createQueue } from './queue.js';
import { createHippocampus } from './hippocampus.js';
import { createVerify } from './verify.js';
import { createBrain } from './brain.js';
import { createRecall } from './recall.js';
import { createEmotion } from './emotion.js';
import { createHealth, createEvolve } from './health.js';
import { createLife } from './life.js';
import { createJudge } from './judge.js';
import { createCustomAreas } from './custom.js';
import { createFts } from './fts.js';
import { createVector } from './vector.js';

export function createCompanionDepth({ stateRoot, coreChars = 12000, logger = null, extraDocs = null, reader = null, features = null, dreamLlm = null } = {}) {
  const state = new CompanionState({ stateRoot, logger });
  const queue = createQueue(state);
  const hippocampus = createHippocampus(state, { coreChars });
  const verify = createVerify(state);
  const brain = createBrain(state);
  const recall = createRecall(state, { extraDocs });
  const emotion = createEmotion(state);
  const health = createHealth(state, { reader, coreTarget: 16000, coreHard: coreChars, personaMax: 12000 });
  const evolve = createEvolve(state);
  const life = createLife(state, { hippocampus, emotion, health, dreamLlm });
  const judge = createJudge(state);
  const custom = createCustomAreas(state, { features });
  const fts = createFts({ stateRoot, logger });
  const vector = createVector({ stateRoot, logger });
  return {
    state,
    queue,
    hippocampus,
    verify,
    brain,
    recall,
    emotion,
    health,
    evolve,
    life,
    judge,
    custom,
    fts,
    vector,
    features,
    status: () => state.status(),
  };
}
