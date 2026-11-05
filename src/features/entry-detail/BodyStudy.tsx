import { useEffect, useId, useRef, useState } from "react";
import type { PhysicalActivityCategory } from "../../domain";
import type { PhysicalProfile } from "../../domain/workouts";
import type { PhysicalProfilePort } from "../../application/workouts";
import { BVChoiceGroup } from "../../ui/BVChoiceGroup";
import {
  atlasMotionLabels,
  atlasPose,
  atlasVariant,
  defaultAtlasMotion,
  type AtlasMotion,
} from "./atlasMotion";
import "./living-atlas.css";

/** Original vector engraving: nested joints, independent contours and shared choreography. */
export function BodyStudy({
  category = "other",
  profile: profilePort,
}: {
  readonly category?: PhysicalActivityCategory;
  readonly profile?: PhysicalProfilePort;
}) {
  const [profile, setProfile] = useState<PhysicalProfile>();
  const [profileError, setProfileError] = useState("");
  const [motion, setMotion] = useState<AtlasMotion>(() =>
    defaultAtlasMotion(category),
  );
  const [paused, setPaused] = useState(false);
  const root = useRef<HTMLElement>(null);
  const rig = useRef<SVGGElement>(null);
  const lastPose = useRef(atlasPose("rest", 0));
  const unique = useId().replace(/:/g, "");
  const variant = atlasVariant(profile);
  const female = variant === "female";
  useEffect(() => {
    let active = true;
    void profilePort?.load().then(
      (value) => {
        if (active) setProfile(value);
      },
      () => {
        if (active)
          setProfileError(
            "Preferência do atlas indisponível. Reabra o treino para consultar.",
          );
      },
    );
    return () => {
      active = false;
    };
  }, [profilePort]);
  useEffect(() => {
    const node = root.current,
      body = rig.current;
    if (!node || !body) return;
    const parts = new Map(
      Array.from(body.querySelectorAll<SVGGElement>("[data-joint]")).map(
        (part) => [part.dataset.joint, part],
      ),
    );
    let frame = 0,
      visible = true,
      previous = 0,
      elapsed = 0;
    let current = lastPose.current;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const shell = node.closest("[data-reduced-motion]");
    const reduced = () =>
      media.matches || shell?.getAttribute("data-reduced-motion") === "true";
    function draw(pose: ReturnType<typeof atlasPose>) {
      if (!body) return;
      body.setAttribute("transform", `translate(210 ${178 + pose.y})`);
      for (const side of [-1, 1]) {
        const key = side < 0 ? "l" : "r";
        parts
          .get(`${key}-thigh`)
          ?.setAttribute(
            "transform",
            `translate(${side * (female ? 22 : 20)} 0) rotate(${-side * pose.thigh})`,
          );
        parts
          .get(`${key}-knee`)
          ?.setAttribute(
            "transform",
            `translate(0 83) rotate(${-side * pose.knee})`,
          );
        parts
          .get(`${key}-ankle`)
          ?.setAttribute(
            "transform",
            `translate(0 83) rotate(${side * (pose.thigh + pose.knee)})`,
          );
        parts
          .get(`${key}-arm`)
          ?.setAttribute(
            "transform",
            `translate(${side * (female ? 37 : 46)} ${-91 + pose.breath}) rotate(${side * -pose.arm})`,
          );
        parts
          .get(`${key}-elbow`)
          ?.setAttribute(
            "transform",
            `translate(0 65) rotate(${side * -pose.elbow})`,
          );
      }
    }
    function tick(now: number) {
      const delta = previous ? Math.min((now - previous) / 1000, 0.05) : 0;
      previous = now;
      elapsed += delta;
      const target = atlasPose(motion, elapsed);
      const blend = 1 - Math.exp(-delta * 7);
      current = {
        y: current.y + (target.y - current.y) * blend,
        thigh: current.thigh + (target.thigh - current.thigh) * blend,
        knee: current.knee + (target.knee - current.knee) * blend,
        arm: current.arm + (target.arm - current.arm) * blend,
        elbow: current.elbow + (target.elbow - current.elbow) * blend,
        breath: target.breath,
      };
      lastPose.current = current;
      draw(current);
      frame = requestAnimationFrame(tick);
    }
    function reconcile() {
      cancelAnimationFrame(frame);
      previous = 0;
      const running = visible && !document.hidden && !paused && !reduced();
      node?.setAttribute("data-animating", String(running));
      if (running) frame = requestAnimationFrame(tick);
      else if (reduced() || paused)
        draw(atlasPose(motion, motion === "rest" ? 0 : 0.8));
    }
    const observer =
      typeof IntersectionObserver === "undefined"
        ? undefined
        : new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            reconcile();
          });
    observer?.observe(node);
    const preference = new MutationObserver(reconcile);
    if (shell)
      preference.observe(shell, {
        attributes: true,
        attributeFilter: ["data-reduced-motion"],
      });
    document.addEventListener("visibilitychange", reconcile);
    media.addEventListener("change", reconcile);
    reconcile();
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      preference.disconnect();
      document.removeEventListener("visibilitychange", reconcile);
      media.removeEventListener("change", reconcile);
    };
  }, [motion, paused, female]);
  const hatch = `atlas-hatch-${unique}`,
    ink = `atlas-ink-${unique}`;
  return (
    <figure
      ref={root}
      className="living-atlas"
      data-variant={variant}
      data-motion={motion}
    >
      <div className="living-atlas__heading">
        <span>Atlas vivo</span>
        <span>{female ? "Estudo feminino" : "Estudo masculino"}</span>
      </div>
      <svg
        viewBox="0 -55 420 490"
        role="img"
        aria-label={`Atlas ${female ? "feminino" : "masculino"}: ${atlasMotionLabels[motion]}. Estudo artístico do movimento.`}
      >
        <defs>
          <pattern
            id={hatch}
            width="5"
            height="5"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(24)"
          >
            <path d="M0 0V5" stroke="#624b3c" strokeWidth=".65" opacity=".32" />
          </pattern>
          <linearGradient id={ink} x1="0" x2="1">
            <stop stopColor="#b38b66" />
            <stop offset=".45" stopColor="#eddbb8" />
            <stop offset=".7" stopColor="#d4b996" />
            <stop offset="1" stopColor="#a78063" />
          </linearGradient>
        </defs>
        <g className="atlas-construction" fill="none" stroke="currentColor">
          <circle cx="210" cy="208" r="167" />
          <circle cx="210" cy="208" r="159" strokeDasharray="1 8" />
          <path d="M43 41H377V375H43ZM210 20V398M22 208H398M78 76L343 341M78 341L343 76" />
          <path d="M203 28h14m-7-7v14M203 388h14m-7-7v14M30 201v14m-7-7h14M390 201v14m-7-7h14" />
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n) => (
            <path
              key={n}
              transform={`rotate(${n * 30} 210 208)`}
              d="M210 41v10"
            />
          ))}
        </g>
        <text className="atlas-script" x="54" y="66">
          I. motus
        </text>
        <text className="atlas-script" x="302" y="363">
          IV. vita
        </text>
        <g
          ref={rig}
          transform="translate(210 178)"
          stroke="#594333"
          strokeWidth="1.1"
          strokeLinejoin="round"
          fill={`url(#${ink})`}
        >
          {/* Each leg has an actual hip and knee. Contours differ between the two studies. */}
          {[-1, 1].map((side) => (
            <g
              key={side}
              data-joint={`${side < 0 ? "l" : "r"}-thigh`}
              transform={`translate(${side * (female ? 22 : 20)} 0)`}
            >
              <path
                d={
                  female
                    ? "M-20-7C-26 14-20 43-12 77Q0 89 12 77C20 49 25 20 17-7Z"
                    : "M-19-8C-24 9-20 41-12 78Q0 88 12 78C19 47 24 16 18-8Z"
                }
              />
              <path
                fill={`url(#${hatch})`}
                stroke="none"
                d="M3 1Q21 20 9 74L0 79Q8 38 3 1Z"
              />
              <path
                className="atlas-muscle"
                d="M-12 6Q-18 37-5 69M9 8Q18 33 5 66M-5 70Q0 60 5 70"
              />
              <g
                data-joint={`${side < 0 ? "l" : "r"}-knee`}
                transform="translate(0 83)"
              >
                <path d="M-11-7Q-19 15-12 42L-7 80Q-4 87 5 82L10 49Q21 17 11-7Q0-13-11-7Z" />
                <path
                  fill={`url(#${hatch})`}
                  stroke="none"
                  d="M3 3Q19 22 7 49L3 79H-2L1 39Z"
                />
                <path
                  className="atlas-muscle"
                  d="M-6 8Q-13 24-3 42L-2 76M7 8Q12 31 3 42M-7-1Q0 5 8-1"
                />
                <g
                  data-joint={`${side < 0 ? "l" : "r"}-ankle`}
                  transform="translate(0 83)"
                >
                  <path
                    d={`M-7-4Q-11 2-10 8Q0 13 ${side * 20} 9L${side * 22} 4Q7 0 5-4Z`}
                  />
                  <path
                    className="atlas-muscle"
                    d={`M-6 4Q1 8 ${side * 15} 6`}
                  />
                </g>
              </g>
            </g>
          ))}
          {/* Distinct torso drafts; an engraved tunic keeps both presentations non-sexualized. */}
          <path
            d={
              female
                ? "M-36-94Q-43-78-31-58Q-21-37-29-18L-37 5Q-20 24 0 20Q20 24 37 5L29-18Q21-37 31-58Q43-78 36-94L15-106H-15Z"
                : "M-43-96Q-53-80-36-53L-27-19-29 9Q0 24 29 9L27-19 36-53Q53-80 43-96L15-106H-15Z"
            }
          />
          <path
            fill={`url(#${hatch})`}
            stroke="none"
            d={
              female
                ? "M12-100Q41-80 25-52Q16-29 26-9L34 4L14 16Q20-9 11-26Q6-59 12-100Z"
                : "M17-98Q44-83 30-55L23-21 27 7 12 14Q21-14 9-33Q13-59 17-98Z"
            }
          />
          {female ? (
            <g className="atlas-muscle">
              <path d="M-25-96Q-14-70 0-65Q14-70 25-96M-31-59Q0-46 31-59M-22-37Q0-30 22-37M-27-16Q0-8 27-16M0-62V-18M-23-88Q-25-72-17-66M23-88Q25-72 17-66" />
              <path d="M-30-12Q-8 4 0 14Q8 4 30-12M-15-5L-12 10M15-5 12 10" />
            </g>
          ) : (
            <g className="atlas-muscle">
              <path d="M0-91V-40M-36-85Q-18-92-4-81L-3-65Q-22-60-35-71M36-85Q18-92 4-81L3-65Q22-60 35-71M-24-55Q-15-49-4-53M24-55Q15-49 4-53M-21-42Q-10-36-3-41M21-42Q10-36 3-41M-21-29Q-9-24-3-28M21-29Q9-24 3-28" />
              <path
                fill="#aa8871"
                d="M-28-15Q0-7 28-15L29 9Q15 21 0 17Q-15 21-29 9Z"
              />
              <path d="M-25-11Q0 0 25-11M0-5V15" />
            </g>
          )}
          <path d="M-14-105L-12-121H12L14-105Q0-96-14-105Z" />
          {[-1, 1].map((side) => (
            <g
              key={side}
              data-joint={`${side < 0 ? "l" : "r"}-arm`}
              transform={`translate(${side * (female ? 37 : 46)} -91)`}
            >
              <path
                d={
                  female
                    ? "M-11-6Q-21 1-15 22L-8 61Q0 71 8 61L14 25Q20 1 11-6Q0-12-11-6Z"
                    : "M-13-7Q-24 2-17 25L-9 61Q0 72 9 61L16 26Q24 2 13-7Q0-13-13-7Z"
                }
              />
              <path
                fill={`url(#${hatch})`}
                stroke="none"
                d="M5-4Q19 7 9 43L4 59 0 55Q7 30 5-4Z"
              />
              <path
                className="atlas-muscle"
                d="M-8 0Q-15 15-6 24M7 7Q12 32 3 52M-6 29Q-11 47-3 56"
              />
              <g
                data-joint={`${side < 0 ? "l" : "r"}-elbow`}
                transform="translate(0 65)"
              >
                <path d="M-8-6Q-14 6-10 22L-5 56Q0 61 5 56L11 18Q13 5 8-6Q0-11-8-6Z" />
                <path className="atlas-muscle" d="M-4 3Q-9 24-1 48M6 5L2 53" />
                <path d="M-5 55L-8 68-6 80Q-1 85 7 78L9 64 5 55ZM-5 61-12 65-12 70-7 69" />
                <path
                  className="atlas-muscle"
                  d="M-2 65-3 77M2 65 1 78M5 65 4 76"
                />
              </g>
            </g>
          ))}
          {female ? (
            <>
              <path
                fill="#725447"
                d="M-18-130Q-25-155-9-163Q5-172 18-157Q25-139 17-124L9-134H-10Z"
              />
              <path d="M-15-149Q-19-137-10-126L0-121 10-126Q19-137 15-149L6-156Q-5-143-15-149Z" />
              <path
                className="atlas-muscle"
                d="M-12-138-5-139M5-139 12-138M0-139-2-132 2-131M-4-126H4"
              />
              <path
                fill="#725447"
                d="M-15-153Q-29-156-26-145Q-23-138-17-145M15-153Q27-153 24-142L17-146"
              />
            </>
          ) : (
            <>
              <path d="M-15-152Q-20-136-12-126L-3-120H3L12-126Q20-136 15-152L7-159H-8Z" />
              <path
                fill="#705446"
                d="M-17-143Q-25-158-12-163Q0-169 15-160L19-146-12-152Z"
              />
              <path
                className="atlas-muscle"
                d="M-12-140-5-141M5-141 12-140M0-141-2-132 2-131M-5-126H5M-12-128-6-124M12-128 6-124"
              />
            </>
          )}
          <path
            className="atlas-muscle"
            d="M-12-106-24-99M12-106 24-99M-6-120-4-108M6-120 4-108"
          />
        </g>
        <g fill="none" stroke="#8c6554" strokeWidth=".7" opacity=".6">
          <path d="M58 143H94L132 113M326 290H350V316M68 300h32l38-34" />
          <circle cx="58" cy="143" r="3" />
          <circle cx="350" cy="316" r="3" />
        </g>
        <text className="atlas-signature" x="210" y="422" textAnchor="middle">
          CORPUS · IN MOTU
        </text>
      </svg>
      <figcaption>
        <BVChoiceGroup
          label="Movimento do atlas"
          value={motion}
          options={Object.entries(atlasMotionLabels).map(([value, label]) => ({
            value,
            label,
          }))}
          onChange={(value) => {
            if (
              value === "rest" ||
              value === "squat" ||
              value === "shoulders" ||
              value === "aerobic"
            )
              setMotion(value);
          }}
        />
        <button
          type="button"
          className="text-button"
          aria-pressed={paused}
          onClick={() => setPaused((value) => !value)}
        >
          {paused ? "Animar atlas" : "Apresentação estática"}
        </button>
      </figcaption>
      {profileError && <p role="status">{profileError}</p>}
    </figure>
  );
}
