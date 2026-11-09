import { Component, Fragment, type ReactNode } from "react";

import { completeStartupExperience } from "../startupExperience";

interface Props {
  readonly children: ReactNode;
  readonly embedded?: boolean;
  readonly resetKey?: string;
  readonly reloadApplication?: () => void;
}
interface State {
  readonly failed: boolean;
  readonly retryKey: number;
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { failed: false, retryKey: 0 };

  static getDerivedStateFromError(): Partial<State> {
    return { failed: true };
  }

  componentDidCatch(): void {
    completeStartupExperience();
    if (import.meta.env.DEV)
      console.error("Falha de renderização sanitizada na interface.");
  }

  componentDidUpdate(previous: Props): void {
    // Navigation recovers an actual failure without remounting healthy rooms.
    if (this.state.failed && previous.resetKey !== this.props.resetKey)
      this.retry();
  }

  private retry = () =>
    this.setState((state) => ({ failed: false, retryKey: state.retryKey + 1 }));
  private reload = () =>
    (this.props.reloadApplication ?? (() => window.location.reload()))();

  render() {
    if (this.state.failed) {
      const RecoveryRegion = this.props.embedded ? "section" : "main";
      return (
        <RecoveryRegion
          className="recovery-page"
          aria-labelledby="recovery-title"
        >
          <section className="content-card">
            <p className="eyebrow">Recuperação da interface</p>
            <h1 id="recovery-title">A tela encontrou um problema</h1>
            <p>
              Seus dados locais não foram apagados. Você pode tentar montar a
              interface novamente ou recarregar o aplicativo.
            </p>
            <div className="inline-actions">
              <button className="button" type="button" onClick={this.retry}>
                Tentar novamente
              </button>
              <button
                className="button button--secondary"
                type="button"
                onClick={this.reload}
              >
                Recarregar aplicativo
              </button>
            </div>
          </section>
        </RecoveryRegion>
      );
    }
    return <Fragment key={this.state.retryKey}>{this.props.children}</Fragment>;
  }
}
