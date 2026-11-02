import { MeshLambertMaterial } from "three";

/** Owned by one building only; shared within that root, never across mounts. */
export function createLibraryBuildingMaterials() {
  return {
    stone: new MeshLambertMaterial({ color: 0x716958 }),
    plaster: new MeshLambertMaterial({ color: 0xd6c6a0 }),
    timber: new MeshLambertMaterial({ color: 0x493024 }),
    oak: new MeshLambertMaterial({ color: 0x956343 }),
    oakLight: new MeshLambertMaterial({ color: 0xad7950 }),
    brass: new MeshLambertMaterial({
      color: 0xbda165,
    }),
    green: new MeshLambertMaterial({ color: 0x35594b }),
    burgundy: new MeshLambertMaterial({ color: 0x713e42 }),
  };
}
