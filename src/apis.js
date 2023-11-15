import http from './http'
import { DEFAULT_MODEL_VERSION } from './constants'

export const getCompletion = (messages, modelVersion = DEFAULT_MODEL_VERSION) => {
  const systemContent = `你回答的内容不能包含反动、色情、违法等不良内容。`;

  const v3Model = 'gpt-3.5-turbo';
  const v4Model = 'gpt-4-1106-preview';

  const model = {
    'v3': v3Model,
    'v4': v4Model
  }[modelVersion] || v3Model;

  return http.post('/v1/chat/completions', {
    messages: [{ role: 'system', content: systemContent }, ...messages],
    model,
    stream: false
  });
};
