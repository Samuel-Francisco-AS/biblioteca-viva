import {
  DataTexture,
  MeshPhongMaterial,
  RepeatWrapping,
  SRGBColorSpace,
} from "three";

/** Original deterministic grain, generated locally; owned by one furniture root. */
export function createWoodGrain() {
  const size = 64;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const wave = Math.sin(x * 0.8 + Math.sin(y * 0.098) * 1.6);
      const pore = ((x * 17 + y * 31) % 13) / 13;
      const v = Math.round(232 + 10 * wave + 5 * pore);
      const i = (y * size + x) * 4;
      data.set([v, v, v, 255], i);
    }
  const texture = new DataTexture(data, size, size);
  texture.name = "bf5e-original-wood-grain";
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export function createFurnitureMaterials() {
  const grain = createWoodGrain();
  const wood = (color: number) =>
    new MeshPhongMaterial({
      color,
      map: grain,
      shininess: 18,
      specular: 0x40322a,
    });
  const cloth = (color: number) =>
    new MeshPhongMaterial({ color, shininess: 5, specular: 0x241b22 });
  return {
    timber: wood(0x39251f),
    oak: wood(0x66432f),
    oakLight: wood(0x966c48),
    brass: new MeshPhongMaterial({
      color: 0xb29861,
      specular: 0xd4b97d,
      shininess: 46,
    }),
    iron: new MeshPhongMaterial({
      color: 0x333e40,
      specular: 0x7e8a8a,
      shininess: 30,
    }),
    stone: new MeshPhongMaterial({ color: 0x76736b, shininess: 3 }),
    plaster: cloth(0xe4cc9c),
    paper: cloth(0xf2dfb7),
    green: cloth(0x244f43),
    burgundy: cloth(0x672d40),
    blue: cloth(0x334c62),
    leather: cloth(0x765139),
  };
}
