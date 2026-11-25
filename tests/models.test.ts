import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import { beforeAll, describe, expect, it } from 'vitest';

type Meta = { body: string; height: number; slots: unknown[]; parts: unknown[]; note?: string };
type Model = { meta: Meta; muscles: number; bones: number };

async function load(file: string): Promise<Model> {
  await MeshoptDecoder.ready;
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
  const root = (await io.read(`public/models/${file}`)).getRoot();
  const meta = (root.listScenes()[0].getExtras() as { howwemove: Meta }).howwemove;
  const count = (name: string) => root.listMeshes().find((m) => m.getName() === name)!.listPrimitives()[0].getAttribute('POSITION')!.getCount();
  return { meta, muscles: count('muscles'), bones: count('skeleton') };
}

describe.each(['high', 'low'])('%s-detail male and female bodies', (lod) => {
  let male: Model;
  let female: Model;
  beforeAll(async () => {
    [male, female] = await Promise.all([load(`body-${lod}.glb`), load(`body-female-${lod}.glb`)]);
  });

  it('share slots, parts and vertex counts, so highlighting and picking line up', () => {
    expect([male.meta.body, female.meta.body]).toEqual(['male', 'female']);
    expect(female.meta.slots).toEqual(male.meta.slots);
    expect(female.meta.parts).toEqual(male.meta.parts);
    expect(female.muscles).toBe(male.muscles);
    expect(female.bones).toBe(male.bones);
  });

  it('makes the female body shorter, within a typical range, and says so in the credit', () => {
    const ratio = female.meta.height / male.meta.height;
    expect(ratio).toBeGreaterThan(0.9);
    expect(ratio).toBeLessThan(0.96);
    expect(female.meta.note).toMatch(/female proportions/);
    expect(male.meta.note).toBeUndefined();
  });
});
