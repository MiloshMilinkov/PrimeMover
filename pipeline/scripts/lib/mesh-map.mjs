/*
 * HowWeMove
 * Copyright (c) 2026 Miloš Milinkov. All rights reserved.
 * Proprietary and confidential. See the LICENSE file.
 */
import { readFileSync } from 'node:fs';

export const MESH_MAP_HEADER = 'app_id,side,bp3d_concept,fma_id,element_file,status';

/** Parses pipeline/mesh-map.csv (quoted cells allowed) into row objects. */
export function readMeshMap(path) {
  return readFileSync(path, 'utf8')
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((line) => {
      const cells = line
        .match(/("([^"]|"")*"|[^,]*)(,|$)/g)
        .map((c) => c.replace(/,$/, '').replace(/^"|"$/g, '').replace(/""/g, '"'));
      const [appId, side, concept, fma, file, status] = cells;
      return { appId, side, concept, fma, file, status };
    });
}
