import Phaser from "phaser";

const COLORS = {
  counter: 0x9a6741,
  creature: 0x799b66,
  floor: 0xd8c5a3,
  librarian: 0x80649c,
  shelf: 0x67452f,
  wall: 0x4c6378,
};

export class InitialLibraryScene extends Phaser.Scene {
  private graphics?: Phaser.GameObjects.Graphics;
  private labels?: Phaser.GameObjects.Container;

  constructor() {
    super("initial-library");
  }

  create(): void {
    this.graphics = this.add.graphics();
    this.scale.on(Phaser.Scale.Events.RESIZE, this.draw, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.draw, this);
      this.labels?.destroy();
    });
    this.draw(this.scale.gameSize);
  }

  private draw = (size: Phaser.Structs.Size): void => {
    const graphics = this.graphics;
    if (!graphics) return;
    const { height, width } = size;
    const margin = Math.max(20, Math.round(width * 0.04));
    const wallHeight = Math.round(height * 0.16);
    const shelfWidth = Math.round(width * 0.26);
    const shelfHeight = Math.round(height * 0.42);
    const counterWidth = Math.round(width * 0.32);
    const counterHeight = Math.round(height * 0.12);
    const labelStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      color: "#28343d",
      fontFamily: "system-ui, sans-serif",
      fontSize: Math.max(12, Math.round(width / 55)),
    };

    graphics.clear();
    this.labels?.destroy();
    this.labels = this.add.container();
    graphics.fillStyle(COLORS.floor).fillRect(0, 0, width, height);
    graphics.fillStyle(COLORS.wall).fillRect(0, 0, width, wallHeight);
    graphics
      .fillStyle(COLORS.shelf)
      .fillRect(margin, wallHeight + margin, shelfWidth, shelfHeight);
    graphics.lineStyle(3, 0xc69b67);
    for (let row = 1; row < 4; row += 1) {
      graphics.lineBetween(
        margin,
        wallHeight + margin + (shelfHeight * row) / 4,
        margin + shelfWidth,
        wallHeight + margin + (shelfHeight * row) / 4,
      );
    }
    graphics
      .fillStyle(COLORS.counter)
      .fillRect(
        width - margin - counterWidth,
        height - margin - counterHeight,
        counterWidth,
        counterHeight,
      );
    graphics
      .fillStyle(COLORS.librarian)
      .fillCircle(
        width - margin - counterWidth * 0.72,
        height - margin - counterHeight - Math.max(18, height * 0.05),
        Math.max(12, width * 0.025),
      );
    graphics
      .fillStyle(COLORS.creature)
      .fillCircle(width * 0.55, height * 0.62, Math.max(14, width * 0.03));

    this.labels.add(
      this.add.text(margin, wallHeight + margin - 24, "Estante", labelStyle),
    );
    this.labels.add(
      this.add.text(
        width - margin - counterWidth,
        height - margin - counterHeight - 24,
        "Balcão",
        labelStyle,
      ),
    );
    this.labels.add(
      this.add.text(
        width - margin - counterWidth * 0.92,
        height - margin - counterHeight - Math.max(55, height * 0.12),
        "Bibliotecária",
        labelStyle,
      ),
    );
    this.labels.add(
      this.add.text(width * 0.49, height * 0.7, "Criatura", labelStyle),
    );
    this.labels.add(
      this.add.text(
        margin,
        Math.max(8, wallHeight * 0.18),
        "Biblioteca — estrutura inicial",
        { ...labelStyle, color: "#ffffff" },
      ),
    );
  };
}
