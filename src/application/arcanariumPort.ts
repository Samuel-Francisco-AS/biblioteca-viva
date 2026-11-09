import type {
  ArcanariumData,
  Card,
  CardVersion,
  Deck,
  StudyCardLink,
  CardSession,
  KnowledgeTag,
} from "../domain/arcanarium";
export interface ArcanariumRepository {
  read(): Promise<ArcanariumData>;
  getCard(id: string): Promise<Card | undefined>;
  getVersion(
    cardId: string,
    revision: number,
  ): Promise<CardVersion | undefined>;
  putCard(card: Card): Promise<void>;
  addVersion(version: CardVersion): Promise<void>;
  getDeck(id: string): Promise<Deck | undefined>;
  putDeck(deck: Deck): Promise<void>;
  deleteDeck(id: string): Promise<void>;
  linksForStudy(studyId: string): Promise<StudyCardLink[]>;
  putLink(link: StudyCardLink): Promise<void>;
  getSession(id: string): Promise<CardSession | undefined>;
  putSession(session: CardSession): Promise<void>;
  putTag(tag: KnowledgeTag): Promise<void>;
}
