export interface MeshMapRow {
  appId: string;
  side: 'left' | 'right' | 'center';
  concept: string;
  fma: string;
  file: string;
  status: 'mapped' | 'generated' | 'unlisted' | 'skeleton';
}

export const MESH_MAP_HEADER: string;
export function readMeshMap(path: string): MeshMapRow[];
