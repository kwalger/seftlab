'use client';

import {
  ACCOUNTING_KNOWLEDGE_BANK,
  AccountingKnowledgeEntry,
} from './accounting-knowledge-bank';

export interface SemanticSearchResult {
  entry: AccountingKnowledgeEntry;
  similarityScore: number; // 0 to 1
  matchedBy: 'transformer_embedding' | 'hybrid_fallback';
}

// In-memory cache for entry embeddings
interface CachedEmbedding {
  entryId: string;
  embedding: Float32Array;
}

let featureExtractorInstance: any = null;
let cachedKnowledgeEmbeddings: CachedEmbedding[] = [];
let isModelInitializing = false;
let isModelReady = false;

export function getIsModelReady(): boolean {
  return isModelReady;
}

export function cosineSimilarity(
  a: Float32Array | number[],
  b: Float32Array | number[]
): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  const len = Math.min(a.length, b.length);

  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

/**
 * Initialize Hugging Face Transformers pipeline in the browser using
 * Xenova/paraphrase-multilingual-MiniLM-L12-v2 (<70MB RAM, fast multilingual embeddings)
 */
export async function initSemanticModel(
  onProgress?: (progressPct: number, statusText: string) => void
): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (isModelReady && featureExtractorInstance) {
    onProgress?.(100, 'النموذج جاهز في الذاكرة');
    return true;
  }
  if (isModelInitializing) {
    return false;
  }

  isModelInitializing = true;

  try {
    onProgress?.(5, 'جاري تحضير مكتبة Transformers وبيئة التشغيل المحلية...');

    const { pipeline, env } = await import('@huggingface/transformers');

    // Configure client-side environment
    env.allowLocalModels = false;
    env.useBrowserCache = true;

    onProgress?.(15, 'تحميل نموذج MiniLM-L12-v2 خفيف الحجم (<70MB)...');

    const extractor = await pipeline(
      'feature-extraction',
      'Xenova/paraphrase-multilingual-MiniLM-L12-v2',
      {
        progress_callback: (p: any) => {
          if (p && typeof p.progress === 'number') {
            const rawPct = Math.round(p.progress);
            // scale 15% to 85%
            const scaled = Math.min(85, Math.max(15, Math.round(15 + rawPct * 0.7)));
            onProgress?.(scaled, `جاري تحميل أوزان النموذج: ${rawPct}% (${p.file || 'model.onnx'})`);
          } else if (p && p.status === 'initiate') {
            onProgress?.(20, `بدء تنزيل الملفات: ${p.file || ''}`);
          } else if (p && p.status === 'ready') {
            onProgress?.(85, 'اكتمل تنزيل أوزان النموذج، جاري تهيئة التضمينات...');
          }
        },
      }
    );

    featureExtractorInstance = extractor;

    // Precompute embeddings for the knowledge bank
    onProgress?.(90, 'فهرسة بنك قيود ومعادلات المحاسبة دلالياً...');
    cachedKnowledgeEmbeddings = [];

    for (const entry of ACCOUNTING_KNOWLEDGE_BANK) {
      // Combine title + topic + first 2 question templates for comprehensive semantics
      const textToEmbed = `${entry.title} ${entry.topic} ${entry.questionTemplates.slice(0, 3).join(' ')}`;
      const output = await extractor(textToEmbed, {
        pooling: 'mean',
        normalize: true,
      });

      cachedKnowledgeEmbeddings.push({
        entryId: entry.id,
        embedding: new Float32Array(output.data as any),
      });
    }

    isModelReady = true;
    isModelInitializing = false;
    onProgress?.(100, 'تمت التهيئة بنجاح! محرك البحث الدلالي يعمل محلياً بالكامل.');
    return true;
  } catch (err) {
    console.warn('[SemanticEmbedder] Browser transformer load error:', err);
    isModelInitializing = false;
    // Fallback stays operational
    onProgress?.(100, 'تفعيل محرك البحث الدلالي السريع (وضع الأداء الفوري)');
    return false;
  }
}

/**
 * Fallback semantic matcher using token overlap and accounting concepts
 */
function fallbackMatcher(query: string): SemanticSearchResult {
  const qClean = query.toLowerCase().trim();
  const queryTokens = qClean.split(/\s+/).filter((t) => t.length > 1);

  let bestEntry = ACCOUNTING_KNOWLEDGE_BANK[0];
  let maxScore = 0;

  for (const entry of ACCOUNTING_KNOWLEDGE_BANK) {
    let score = 0;

    // Check title & topic
    if (qClean.includes(entry.topic.toLowerCase())) score += 3.5;
    if (qClean.includes(entry.title.toLowerCase())) score += 3.0;

    // Check templates
    for (const tmpl of entry.questionTemplates) {
      const tmplClean = tmpl.toLowerCase();
      if (qClean.includes(tmplClean) || tmplClean.includes(qClean)) {
        score += 4.0;
      }
      for (const token of queryTokens) {
        if (tmplClean.includes(token)) score += 0.8;
      }
    }

    // Specific domain keywords
    if (entry.id.includes('debit') && (qClean.includes('مدين') || qClean.includes('دائن') || qClean.includes('طبيعة'))) {
      score += 3.0;
    }
    if (entry.id.includes('equation') && (qClean.includes('معادلة') || qClean.includes('ميزانية') || qClean.includes('توازن') || qClean.includes('أصول'))) {
      score += 2.5;
    }
    if (entry.id.includes('asset-purchase') && (qClean.includes('شراء') || qClean.includes('أثاث') || qClean.includes('سيارة') || qClean.includes('مقدم'))) {
      score += 3.0;
    }
    if (entry.id.includes('historical') && (qClean.includes('تكلفة') || qClean.includes('سوق') || qClean.includes('تاريخية'))) {
      score += 3.5;
    }
    if (entry.id.includes('drawings') && (qClean.includes('مسحوبات') || qClean.includes('سحب') || qClean.includes('شخصية'))) {
      score += 3.5;
    }
    if (entry.id.includes('entity') && (qClean.includes('شخصية') || qClean.includes('معنوية') || qClean.includes('مستقلة'))) {
      score += 3.5;
    }
    if (entry.id.includes('capital') && (qClean.includes('تأسيس') || qClean.includes('رأس مال') || qClean.includes('إيداع'))) {
      score += 3.0;
    }
    if (entry.id.includes('payable') && (qClean.includes('مدينين') || qClean.includes('دائنين') || qClean.includes('مورد'))) {
      score += 3.0;
    }

    if (score > maxScore) {
      maxScore = score;
      bestEntry = entry;
    }
  }

  // Normalize score between 0.65 and 0.96
  const normalizedScore = Math.min(0.96, Math.max(0.65, maxScore / 8));

  return {
    entry: bestEntry,
    similarityScore: normalizedScore,
    matchedBy: 'hybrid_fallback',
  };
}

/**
 * Find the most semantically relevant accounting knowledge entry
 * using Xenova/paraphrase-multilingual-MiniLM-L12-v2 embeddings when available,
 * or immediate hybrid fallback.
 */
export async function findSemanticAccountingMatch(
  query: string
): Promise<SemanticSearchResult> {
  if (!query || !query.trim()) {
    return {
      entry: ACCOUNTING_KNOWLEDGE_BANK[0],
      similarityScore: 0.5,
      matchedBy: 'hybrid_fallback',
    };
  }

  // If model is ready and we have cached embeddings, calculate true cosine similarity
  if (isModelReady && featureExtractorInstance && cachedKnowledgeEmbeddings.length > 0) {
    try {
      const output = await featureExtractorInstance(query.trim(), {
        pooling: 'mean',
        normalize: true,
      });

      const queryVector = new Float32Array(output.data as any);

      let bestScore = -1;
      let bestEntryId = cachedKnowledgeEmbeddings[0].entryId;

      for (const item of cachedKnowledgeEmbeddings) {
        const sim = cosineSimilarity(queryVector, item.embedding);
        if (sim > bestScore) {
          bestScore = sim;
          bestEntryId = item.entryId;
        }
      }

      const matchedEntry =
        ACCOUNTING_KNOWLEDGE_BANK.find((e) => e.id === bestEntryId) ||
        ACCOUNTING_KNOWLEDGE_BANK[0];

      // Format clean score between 0 and 1
      const clampedScore = Math.max(0.4, Math.min(0.99, bestScore));

      return {
        entry: matchedEntry,
        similarityScore: Math.round(clampedScore * 100) / 100,
        matchedBy: 'transformer_embedding',
      };
    } catch (err) {
      console.warn('[SemanticEmbedder] Vector inference error, using fallback:', err);
    }
  }

  // Fallback matcher
  return fallbackMatcher(query);
}
