import { configureGenkit } from '@genkit-ai/core';
import { googleAI } from '@genkit-ai/googleai';
import { defineFlow, runFlow } from '@genkit-ai/flow';

// Configure Genkit with Google AI
export const ai = configureGenkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

export { defineFlow as flow, runFlow };