import type { ApplicationEventBus } from "../../application";
import type { DomainEvent } from "../../domain";

type DomainEventType = DomainEvent["type"];
export type DomainEventListener = (event: DomainEvent) => void | Promise<void>;

export class LocalEventBus implements ApplicationEventBus {
  private readonly listeners = new Map<
    DomainEventType,
    Set<DomainEventListener>
  >();

  subscribe(type: DomainEventType, listener: DomainEventListener): () => void {
    const listeners = this.listeners.get(type) ?? new Set();
    listeners.add(listener);
    this.listeners.set(type, listeners);
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) this.listeners.delete(type);
    };
  }

  async publish(event: DomainEvent): Promise<void> {
    const listeners = [...(this.listeners.get(event.type) ?? [])];
    for (const listener of listeners) await listener(event);
  }
}
