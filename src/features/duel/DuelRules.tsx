import { Link } from "react-router-dom";
import { RULESET } from "../../domain/duel/contracts";
export function DuelRules() {
  return (
    <article className="duel duel-rules">
      <Link to="/arcanario/duelos">← Salão dos duelos</Link>
      <p className="arcana-eyebrow">REGULAMENTO COMPLETO · {RULESET}</p>
      <h2>Como traçar seu círculo</h2>
      {[
        [
          "O objetivo",
          "Cada duelista começa com 20 de vida. Invoque criaturas, conjure feitiços e mantenha artefatos. Reduzir a vida adversária a zero vence. Se ambos chegarem a zero na mesma ação, há empate. As cartas são independentes de leitura, estudos e progresso educativo.",
        ],
        [
          "Antes da partida",
          "Um deck Oficial ou Criador tem 24 cartas, até duas cópias por identidade, uma afinidade e cartas neutras. Oficial usa apenas a coleção validada; Criador também aceita cartas autorais com orçamento aproximado. Livre aceita 12–60 cartas, até quatro cópias e mistura afinidades, mantendo limites técnicos. Seus resultados experimentais ficam separados dos oficiais. Todos os decks iniciais ficam disponíveis offline.",
        ],
        [
          "Preparação e turnos",
          "O deck é embaralhado pela semente registrada. Quem começa recebe quatro cartas, o segundo recebe cinco. O primeiro não compra no turno inicial. No início dos demais turnos, compre uma carta, aumente energia máxima em um até seis e recupere toda energia. Artefatos de início ativam em ordem de entrada após a compra. A mão comporta oito cartas; o excesso comprado vai ao cemitério.",
        ],
        [
          "Jogar suas cartas",
          "No seu turno, alterne livremente cartas, ataques e ativações. Pague a energia indicada na carta. Sobra não acumula entre turnos. O campo comporta quatro criaturas e dois artefatos; sem vaga, não é possível jogá-los. Feitiços resolvem e vão ao cemitério; artefatos permanecem até destruídos. Não há posições, bloqueios por faixa ou resposta no turno inimigo.",
        ],
        [
          "Ataques e proteção",
          "Uma criatura ataca uma vez por turno. Não ataca no turno da invocação, salvo Ímpeto. Escolha o duelista ou uma criatura inimiga. Se há Guardiões inimigos, ataques devem escolher um deles. Feitiços ignoram Guardião. Criaturas trocam dano simultaneamente, mesmo se a defensora estiver exausta. Duelistas não retaliam. Ataque zero não permite atacar.",
        ],
        [
          "Vida, escudo e condições",
          "O dano fica marcado na criatura. Escudo absorve e se consome antes da resistência, até 12 por criatura. Cura retira dano de criatura ou restaura seu duelista até 20. Fortalecer dá +N ataque e +N resistência; permanente dura na unidade e temporário expira ao encerrar o turno atual. A expiração pode derrotar uma criatura ferida. Até 32 modificadores por criatura. Exaustão impede ataques até o fim do próximo turno do controlador, mas permite retaliar e ativar habilidades.",
        ],
        [
          "Habilidades",
          "Ao jogar ativa na entrada; Início do seu turno é automático em artefatos; Ativar exige botão, custo adicional e permite uma vez por habilidade no seu turno, inclusive na entrada. Efeitos exigem alvos válidos antes do pagamento. Uma ação usa o mesmo alvo para seus efeitos direcionados. Criaturas derrotadas saem após cada efeito; cura posterior não as ressuscita. Efeitos globais seguem ordem de entrada. Não existem respostas, scripts ou gatilhos de morte recursivos.",
        ],
        [
          "O catálogo de magia",
          "Dano; cura; compra; escudo; fortalecer; invocar sentinelas 1/1; drenar dano efetivo para curar seu duelista; dano variável de 1 a N registrado pela semente; perscrutar até N cartas do topo ordenando por custo crescente; exaustão; destruir o artefato inimigo mais antigo. Invocações de efeito excedentes não nascem. Limite de 512 snapshots por partida impede criação ilimitada de tokens. Escudo e sobre-dano não aumentam a cura de Drenar.",
        ],
        [
          "Fim do turno e fadiga",
          "Encerrar expira os efeitos temporários, remove criaturas derrotadas e passa a vez. O novo duelista recupera recursos, compra e resolve artefatos. Comprar de um deck vazio causa 1, depois 2, depois 3… de dano de fadiga. O resultado é avaliado após toda a ação; uma cura na mesma resolução pode impedir derrota.",
        ],
        [
          "Pausa, abandono e segurança",
          "A ação só é confirmada depois de salva. Sair ou fechar o aplicativo preserva a última confirmação; retomar não repete efeitos. Pausar suspende inclusive a IA. Abandono pede confirmação e conta como derrota permanente. Limites: 120 turnos, 4096 comandos, 64 ações por turno (depois só encerrar), 64 efeitos por resolução. Limites globais causam empate técnico. Ações inválidas, repetidas, fora do turno ou após o fim são rejeitadas.",
        ],
        [
          "Criação e futuro",
          "A Oficina permite escolher habilidades tipadas, sem código. Seu orçamento de poder é aproximação, não certificado competitivo. A IA local avalia letal, ameaças, trocas e recursos sem consultar cartas ocultas. Há um nível de decisão e quatro tradições. Arena 3D, PvP e campanhas não fazem parte deste regulamento/apresentação inicial.",
        ],
      ].map(([title, text]) => (
        <section key={title}>
          <h3>{title}</h3>
          <p>{text}</p>
        </section>
      ))}
    </article>
  );
}
