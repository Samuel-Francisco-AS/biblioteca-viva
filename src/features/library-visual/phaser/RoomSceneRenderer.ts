import Phaser from "phaser";

import type { RoomViewModel } from "../contracts";
import {
  decorationsForRoomStage,
  roomLighting,
  type RoomVisualDefinition,
} from "./roomVisuals";

export interface RoomRenderSize {
  readonly height: number;
  readonly width: number;
}

/** Shared procedural renderer for P2 rooms. It owns only room-specific objects. */
export class RoomSceneRenderer {
  private readonly graphics: Phaser.GameObjects.Graphics;
  private readonly lighting: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    this.graphics = scene.add.graphics().setDepth(20);
    this.lighting = scene.add.graphics().setDepth(60);
  }

  destroy(): void {
    this.graphics.destroy();
    this.lighting.destroy();
  }

  render(
    definition: RoomVisualDefinition,
    room: RoomViewModel,
    size: RoomRenderSize,
  ): void {
    const { height, width } = size;
    const margin = Math.max(14, Math.round(width * 0.05));
    const wallHeight = Math.max(56, Math.round(height * 0.18));
    const work = {
      x: margin,
      y: wallHeight + margin,
      width: width - margin * 2,
      height: height - wallHeight - margin * 2,
    };
    const palette = room.highContrast
      ? { accent: 0xffffff, floor: 0x000000, wall: 0x171717 }
      : definition.palette;
    const g = this.graphics;
    g.clear();
    g.fillStyle(palette.floor).fillRect(0, 0, width, height);
    g.fillStyle(palette.wall).fillRect(0, 0, width, wallHeight);
    g.fillStyle(0x533824).fillRect(0, wallHeight - 5, width, 5);
    for (
      let y = wallHeight;
      y < height;
      y += Math.max(20, Math.round(height / 11))
    )
      g.lineStyle(1, 0x211915, 0.5).lineBetween(0, y, width, y);
    this.drawBase(definition.roomId, g, work, palette.accent);
    decorationsForRoomStage(definition, room.stage).forEach((id, index) =>
      this.drawDecoration(g, id, work, index, palette.accent),
    );
    const light = roomLighting(definition, room.dayPeriod);
    this.lighting.clear();
    this.lighting
      .fillStyle(0xffcb78, light.localAlpha)
      .fillCircle(
        work.x + work.width * 0.68,
        work.y + work.height * 0.3,
        Math.max(42, width * 0.16),
      );
    this.lighting
      .fillStyle(light.overlayColor, light.overlayAlpha)
      .fillRect(0, 0, width, height);
  }

  private drawBase(
    roomId: RoomViewModel["roomId"],
    g: Phaser.GameObjects.Graphics,
    area: { x: number; y: number; width: number; height: number },
    accent: number,
  ): void {
    const desk = {
      x: area.x + area.width * 0.5,
      y: area.y + area.height * 0.53,
      w: area.width * 0.32,
      h: area.height * 0.12,
    };
    if (roomId === "study-room" || roomId === "office") {
      g.fillStyle(0x5b3925)
        .fillRoundedRect(desk.x, desk.y, desk.w, desk.h, 5)
        .fillStyle(0x8a5a36)
        .fillRect(desk.x + 5, desk.y + 5, desk.w - 10, desk.h - 10);
      g.fillStyle(0x41291e).fillRect(
        desk.x + desk.w * 0.35,
        desk.y + desk.h + 6,
        desk.w * 0.3,
        area.height * 0.13,
      );
      g.fillStyle(0x573925).fillRoundedRect(
        area.x + area.width * 0.08,
        area.y + area.height * 0.14,
        area.width * 0.2,
        area.height * 0.46,
        4,
      );
      for (
        let y = area.y + area.height * 0.22;
        y < area.y + area.height * 0.57;
        y += 16
      )
        g.lineStyle(3, accent).lineBetween(
          area.x + area.width * 0.1,
          y,
          area.x + area.width * 0.26,
          y,
        );
    } else if (roomId === "projection-room") {
      g.fillStyle(0xd8c9a7)
        .fillRoundedRect(
          area.x + area.width * 0.2,
          area.y + area.height * 0.1,
          area.width * 0.6,
          area.height * 0.34,
          4,
        )
        .lineStyle(5, 0x5b3925)
        .strokeRoundedRect(
          area.x + area.width * 0.2,
          area.y + area.height * 0.1,
          area.width * 0.6,
          area.height * 0.34,
          4,
        );
      g.fillStyle(0x352a2b)
        .fillCircle(area.x + area.width * 0.5, area.y + area.height * 0.66, 12)
        .fillRect(
          area.x + area.width * 0.47,
          area.y + area.height * 0.66,
          area.width * 0.06,
          area.height * 0.13,
        );
      [0.25, 0.48, 0.71].forEach((position) =>
        g
          .fillStyle(0x604333)
          .fillRoundedRect(
            area.x + area.width * position - 16,
            area.y + area.height * 0.78,
            32,
            22,
            4,
          ),
      );
    } else {
      g.fillStyle(0x6c4c2d)
        .fillRoundedRect(
          area.x + area.width * 0.18,
          area.y + area.height * 0.52,
          area.width * 0.64,
          area.height * 0.25,
          4,
        )
        .fillStyle(0x7d6f52)
        .fillRoundedRect(
          area.x + area.width * 0.33,
          area.y + area.height * 0.37,
          area.width * 0.34,
          area.height * 0.25,
          4,
        );
      g.fillStyle(0x4a321f).fillRoundedRect(
        area.x + area.width * 0.1,
        area.y + area.height * 0.75,
        area.width * 0.25,
        area.height * 0.1,
        4,
      );
    }
  }

  private drawDecoration(
    g: Phaser.GameObjects.Graphics,
    id: string,
    area: { x: number; y: number; width: number; height: number },
    index: number,
    accent: number,
  ): void {
    const x = area.x + area.width * (0.68 + index * 0.09);
    const y = area.y + area.height * (0.22 + (index % 2) * 0.18);
    if (id.endsWith("lamp"))
      g.fillStyle(0xffcf7a, 0.9)
        .fillCircle(x, y, 10)
        .fillStyle(0x40302a)
        .fillRect(x - 2, y + 8, 4, 18);
    else if (id.endsWith("map") || id.endsWith("board"))
      g.fillStyle(0xb7a77f)
        .fillRect(x - 22, y - 14, 44, 28)
        .lineStyle(2, 0x604333)
        .strokeRect(x - 22, y - 14, 44, 28);
    else if (id.endsWith("globe") || id.endsWith("reel"))
      g.fillStyle(accent)
        .fillCircle(x, y, 13)
        .lineStyle(2, 0xd8c9a7)
        .strokeCircle(x, y, 13);
    else if (id.endsWith("curtains") || id.endsWith("rope"))
      g.lineStyle(6, 0x733b36)
        .lineBetween(x - 25, y - 24, x - 25, y + 26)
        .lineBetween(x + 25, y - 24, x + 25, y + 26);
    else if (id.endsWith("weights") || id.endsWith("rack"))
      g.lineStyle(5, 0x7f7863)
        .lineBetween(x - 20, y, x + 20, y)
        .fillStyle(0x4a403a)
        .fillCircle(x - 19, y, 8)
        .fillCircle(x + 19, y, 8);
    else
      g.fillStyle(0x352b2a)
        .fillRect(x - 18, y - 8, 36, 16)
        .fillStyle(accent)
        .fillRect(x - 12, y - 4, 24, 3);
  }
}
