/**
 * Optional LLM dream narrator. It uses the Harness `llm` service and the current
 * default model; if either is missing, the caller falls back to the local
 * template. This keeps dream generation optional and never requires an API key
 * from the companion plugin itself.
 */
export function createDreamLlm(ctx) {
  async function generate({ memories = [], emotions = [], focus = '' } = {}) {
    const llm = ctx?.get?.('llm');
    const defaultModel = ctx?.get?.('agentDefaultModel');
    if (!llm || typeof llm.stream !== 'function' || !defaultModel) return null;
    let selection = null;
    try {
      selection = defaultModel.currentSelection?.();
    } catch {
      selection = null;
    }
    const provider = selection?.provider;
    const model = selection?.model ?? selection?.modelId;
    if (!provider || !model) return null;
    const prompt = [
      '你是记忆助手的梦叙事器。只写一段 2–4 句的梦，第一人称，温柔、具体，不要解释。',
      focus ? `当前焦点：${focus}` : '',
      memories.length ? `记忆碎片：${memories.join('；')}` : '',
      emotions.length ? `情绪底色：${emotions.join('、')}` : '',
    ].filter(Boolean).join('\n');
    const agent = ctx?.agents?.currentInitiator?.() ?? null;
    const options = {
      provider,
      model,
      system: '你写梦，不写总结，不写分析。',
      messages: [{ role: 'user', content: [{ type: 'text', text: prompt }] }],
      temperature: 0.95,
      maxTokens: 360,
      purpose: 'companion-dream',
      ...(agent?.session?.id ? { sessionId: agent.session.id } : {}),
    };
    let text = '';
    for await (const chunk of llm.stream(options)) {
      if (chunk?.type === 'text-delta' && chunk.text) text += chunk.text;
      if (chunk?.type === 'finish' && chunk.reason?.kind === 'error') return null;
    }
    const value = text.trim();
    return value || null;
  }

  return { available: () => Boolean(ctx?.get?.('llm') && ctx?.get?.('agentDefaultModel')), generate };
}
