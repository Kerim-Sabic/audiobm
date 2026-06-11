import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'

/**
 * Nakon izmjene u CMS-u ponovo gradi pogođene stranice (ISR on-demand).
 * Tokom seed-a i izvan Next konteksta tiho preskače.
 */
const osvjezi = async (putanje: string[]) => {
  if (process.env.PAYLOAD_SEED === 'true') return
  try {
    const { revalidatePath } = await import('next/cache')
    for (const p of putanje) revalidatePath(p)
  } catch {
    /* payload run skripte nemaju Next kontekst */
  }
}

export const revalidirajKolekciju =
  (putanje: (doc: Record<string, unknown>) => string[]): CollectionAfterChangeHook =>
  async ({ doc }) => {
    await osvjezi(putanje(doc))
    return doc
  }

export const revalidirajBrisanje =
  (putanje: (doc: Record<string, unknown>) => string[]): CollectionAfterDeleteHook =>
  async ({ doc }) => {
    await osvjezi(putanje(doc))
    return doc
  }

export const revalidirajGlobal =
  (putanje: string[]): GlobalAfterChangeHook =>
  async ({ doc }) => {
    await osvjezi(putanje)
    return doc
  }
