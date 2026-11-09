import type { ArcanariumRepository } from "../../application/arcanariumPort";
import {
  cardSchema,
  cardVersionSchema,
  deckSchema,
  studyCardLinkSchema,
  cardSessionSchema,
  knowledgeTagSchema,
  arcanariumDataSchema,
  type Card,
  type CardVersion,
  type Deck,
  type StudyCardLink,
  type CardSession,
  type KnowledgeTag,
} from "../../domain/arcanarium";
import type { BibliotecaDatabase } from "./database";
export class DexieArcanariumRepository implements ArcanariumRepository {
  constructor(private readonly db: BibliotecaDatabase) {}
  async read() {
    const [cards, versions, decks, studyLinks, tags, sessions] =
      await Promise.all([
        this.db.arcanariumCards.toArray(),
        this.db.arcanariumVersions.toArray(),
        this.db.arcanariumDecks.toArray(),
        this.db.studyCardLinks.toArray(),
        this.db.knowledgeTags.toArray(),
        this.db.cardSessions.toArray(),
      ]);
    return arcanariumDataSchema.parse({
      cards,
      versions,
      decks,
      studyLinks,
      tags,
      sessions,
    });
  }
  async getCard(id: string) {
    const value = await this.db.arcanariumCards.get(id);
    return value === undefined ? undefined : cardSchema.parse(value);
  }
  async getVersion(cardId: string, revision: number) {
    const value = await this.db.arcanariumVersions.get([cardId, revision]);
    return value === undefined ? undefined : cardVersionSchema.parse(value);
  }
  async putCard(card: Card) {
    await this.db.arcanariumCards.put(cardSchema.parse(card));
  }
  async addVersion(version: CardVersion) {
    await this.db.arcanariumVersions.add(cardVersionSchema.parse(version));
  }
  async getDeck(id: string) {
    const value = await this.db.arcanariumDecks.get(id);
    return value === undefined ? undefined : deckSchema.parse(value);
  }
  async putDeck(deck: Deck) {
    await this.db.arcanariumDecks.put(deckSchema.parse(deck));
  }
  async deleteDeck(id: string) {
    await this.db.arcanariumDecks.delete(id);
  }
  async linksForStudy(studyId: string) {
    return (
      await this.db.studyCardLinks.where("studyId").equals(studyId).toArray()
    ).map((link) => studyCardLinkSchema.parse(link));
  }
  async putLink(link: StudyCardLink) {
    await this.db.studyCardLinks.put(studyCardLinkSchema.parse(link));
  }
  async getSession(id: string) {
    const value = await this.db.cardSessions.get(id);
    return value === undefined ? undefined : cardSessionSchema.parse(value);
  }
  async putSession(session: CardSession) {
    await this.db.cardSessions.put(cardSessionSchema.parse(session));
  }
  async putTag(tag: KnowledgeTag) {
    await this.db.knowledgeTags.put(knowledgeTagSchema.parse(tag));
  }
}
