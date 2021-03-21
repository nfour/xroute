// overmind/index.ts
import {
  createActionsHook,
  createEffectsHook,
  createHook,
  createReactionHook,
  createStateHook,
} from 'overmind-react';
// index.tsx
import { createOvermind, IConfiguration } from 'overmind';

export function setupOvermind<T extends IConfiguration>(config: T) {
  const overmind = createOvermind<T>(config, {
    devtools: false,
  });
  const useOvermind = createHook<typeof config>();
  const useState = createStateHook<typeof config>();
  const useActions = createActionsHook<typeof config>();
  const useEffects = createEffectsHook<typeof config>();
  const useReaction = createReactionHook<typeof config>();

  return {
    config,
    overmind,
    useOvermind,
    useState,
    useActions,
    useEffects,
    useReaction,
  };
}
