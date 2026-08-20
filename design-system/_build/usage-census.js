/**
 * usage-census · how many times each component is actually placed
 * ---------------------------------------------------------------------------
 * Paste into a `use_figma` call and return `await census()`.
 * Pure read; mutates nothing.
 *
 * Why this exists: a component that appears only inside its own documentation
 * frame is a specimen, not part of the system. Coverage counts cannot tell the
 * difference; instance counts can.
 *
 * Why it runs four times: Figma loads pages and instance subtrees lazily, so a
 * cold first pass under-reports with no error at all. See 00-principles §B4 —
 * the count is only trustworthy once two consecutive passes agree.
 */

const CONFIG = {
  // pages whose components are the library
  libraryPages: /^(Components|Blocks|Brand)/,
  maxPasses: 4,
};

async function census() {
  // 1. map every variant id back to the component (or set) that owns it
  const ownerOf = {};
  for (const page of figma.root.children) {
    if (!CONFIG.libraryPages.test(page.name)) continue;
    await page.loadAsync();
    for (const c of page.findAllWithCriteria({ types: ['COMPONENT_SET', 'COMPONENT'] })) {
      if (c.type === 'COMPONENT' && c.parent && c.parent.type === 'COMPONENT_SET') continue;
      const ids = c.type === 'COMPONENT_SET' ? c.children.map(x => x.id) : [c.id];
      ids.forEach(id => ownerOf[id] = c.name);
    }
  }

  async function pass() {
    const use = {};
    for (const page of figma.root.children) {
      await page.loadAsync();
      for (const inst of page.findAllWithCriteria({ types: ['INSTANCE'] })) {
        const main = await inst.getMainComponentAsync();
        if (main && ownerOf[main.id]) use[ownerOf[main.id]] = (use[ownerOf[main.id]] || 0) + 1;
      }
    }
    return use;
  }

  const passes = [];
  let converged = null;
  for (let i = 0; i < CONFIG.maxPasses; i++) {
    passes.push(await pass());
    if (i > 0 && JSON.stringify(passes[i]) === JSON.stringify(passes[i - 1])) { converged = passes[i]; break; }
  }
  const use = converged || passes[passes.length - 1];

  const all = [...new Set(Object.values(ownerOf))];
  const ranked = Object.entries(use).sort((a, b) => b[1] - a[1]);
  return {
    converged: !!converged,
    passTotals: passes.map(p => Object.values(p).reduce((a, b) => a + b, 0)),
    components: all.length,
    instances: Object.values(use).reduce((a, b) => a + b, 0),
    ranked,
    // a component whose only instances are its own doc previews
    specimens: ranked.filter(([, n]) => n <= 2).map(([n]) => n),
    unused: all.filter(n => !use[n]).sort(),
  };
}
