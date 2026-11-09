import process from "node:process";
import { Buffer } from "node:buffer";
import console from "node:console";
/** Original editable vector engravings for Biblioteca Viva. No external image sources. */
import fs from "node:fs";
import crypto from "node:crypto";
const source = fs.readFileSync("src/domain/duel/catalogue.ts", "utf8");
const rows = [
  ...source.matchAll(
    /(creature|spell|artifact)\(\s*"(\w+)",\s*"([^"]+)",\s*"([^"]+)",[\s\S]*?"([^"]+)",\s*"([^"]+)"/g,
  ),
].map((m) => ({
  kind: m[1],
  affinity: m[2],
  id: m[3],
  name: m[4],
  flavor: m[5],
  subject: m[6],
}));
if (rows.length !== 48)
  throw new Error(`Expected 48 art briefs; got ${rows.length}`);
const palettes = {
  ruin: ["#100d20", "#33243d", "#9d6cc9", "#ffb174", "#e5c4f0"],
  knowledge: ["#091a30", "#173b59", "#4696b5", "#e8c675", "#daeef6"],
  bloom: ["#0a211e", "#234334", "#64b8a1", "#e8d48b", "#e0f3ca"],
  chaos: ["#1f0c35", "#4a2259", "#a06cf0", "#f19bd3", "#f7d2ee"],
  neutral: ["#171d2b", "#354452", "#829fba", "#dfc89a", "#e8e2d7"],
};
const path = (
  d,
  fill = "url(#body)",
  stroke = "var(--gold)",
  width = 1.8,
  extra = "",
) =>
  `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="round" ${extra}/>`;
const circle = (x, y, r, fill = "none", stroke = "var(--gold)", w = 1) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${w}"/>`;
const eye = (x, y, r = 3) =>
  path(
    `M${x - r * 2.3} ${y} Q${x} ${y - r * 1.5} ${x + r * 2.3} ${y} Q${x} ${y + r * 1.5} ${x - r * 2.3} ${y} Z`,
    "var(--light)",
    "var(--gold)",
    0.7,
  ) +
  path(
    `M${x} ${y - r} L${x + r * 0.5} ${y} L${x} ${y + r} L${x - r * 0.5} ${y} Z`,
    "var(--dark)",
    "none",
  ) +
  circle(x - r * 0.6, y - r * 0.4, 0.7, "var(--light)", "none");
const leaf = (x, y, angle = 0, size = 1) =>
  `<g transform="translate(${x} ${y}) rotate(${angle}) scale(${size})">${path("M0 0 Q-25 -28 0 -50 Q23 -22 0 0", "url(#petal)", "var(--rim)", 1)}${path("M0 -4 V-43", "none", "var(--gold)", 0.7)}</g>`;
const wing = (flip = 1, dy = 0) =>
  `<g transform="translate(240 ${165 + dy}) scale(${flip} 1)">${path("M-7 15 C-54 -55 -131 -89 -185 -70 C-143 -45 -164 -6 -137 7 L-109 -2 L-113 26 L-77 19 L-61 44 L-29 29 Z")}${path("M-10 16 L-166 -62 M-18 20 L-137 6 M-24 23 L-110 25 M-30 24 L-63 43", "none", "var(--rim)", 1)}</g>`;
const horn = (flip = 1) =>
  `<g transform="translate(240 136) scale(${flip} 1)">${path("M-17 0 Q-68 -24 -45 -65 Q-46 -23 -9 -19 Z", "url(#bone)")}</g>`;
const core = (x = 240, y = 185, r = 24) =>
  circle(x, y, r * 1.9, "url(#glow)", "none") +
  circle(x, y, r, "url(#gem)", "var(--light)", 2) +
  path(
    `M${x - r} ${y} L${x} ${y - r} L${x + r} ${y} L${x} ${y + r} Z`,
    "none",
    "var(--gold)",
    0.8,
  );
const petals = (x, y, count = 7, size = 0.7) =>
  Array.from({ length: count }, (_, i) =>
    leaf(x, y, (i * 360) / count, size),
  ).join("") + circle(x, y, 6, "var(--gold)");
const engraved = (x, y, amount = 9, step = 7) =>
  Array.from({ length: amount }, (_, i) =>
    path(
      `M${x + i * step - 3} ${y - (i % 2) * 3} l3 -5 l3 5 l-3 4 Z`,
      "none",
      "var(--rim)",
      0.7,
    ),
  ).join("");
function creature(subject) {
  switch (subject) {
    case "imp":
      return (
        wing(1, 22) +
        wing(-1, 22) +
        horn() +
        horn(-1) +
        path(
          "M216 154 Q203 177 214 218 L198 264 L222 258 L238 222 L250 266 L274 269 L260 218 Q283 172 262 150 Z",
        ) +
        path(
          "M220 176 L182 214 L173 200 L177 232 L218 211 M260 179 L295 210 L306 190 L310 222 L266 218",
        ) +
        path(
          "M218 125 L239 116 L264 130 L258 161 L239 173 L219 154 Z",
          "url(#bone)",
        ) +
        eye(229, 144) +
        eye(251, 144) +
        path("M229 156 L242 160 L252 153", "none", "var(--dark)", 2) +
        core(239, 190, 9)
      );
    case "guardian":
    case "sentinel":
      return (
        path(
          "M154 276 L176 139 L201 127 L212 88 L244 69 L273 91 L279 124 L306 139 L325 279 L286 277 L274 221 L210 224 L194 277 Z",
        ) +
        path(
          "M191 142 L216 152 L208 214 L176 226 Z M289 143 L268 151 L277 219 L307 233 Z",
          "url(#bone)",
        ) +
        path(
          "M216 104 L239 94 L263 104 L257 142 L240 153 L221 140 Z",
          "var(--dark)",
        ) +
        eye(230, 121) +
        eye(250, 121) +
        core(241, 185, 18) +
        path(
          "M221 157 L237 176 L229 208 L249 228 L240 273 M258 158 L249 178 L264 203",
          "none",
          "var(--gold)",
          2,
        ) +
        engraved(207, 247, 9, 8) +
        (subject === "sentinel"
          ? circle(240, 122, 62, "none", "var(--rim)", 1) +
            path(
              "M151 182 V281 M136 281 H167 M151 182 L142 161 L152 144 L163 161 Z",
              "var(--gold)",
            )
          : horn() + horn(-1))
      );
    case "serpent":
    case "leviathan":
      return (
        path(
          "M109 263 C57 224 85 151 151 171 C224 190 132 254 210 276 C282 296 354 251 310 205 C279 173 243 212 220 173 C202 139 251 93 286 118 L321 112 L305 145 L279 160 C265 154 258 144 247 153 C231 172 302 166 332 198 C398 273 282 320 197 301 C105 281 167 221 145 207 C115 188 106 223 127 241 Z",
        ) +
        path(
          "M268 122 L266 93 L285 113 L302 83 L303 117 M220 167 L208 154 L213 194 L236 203",
          "url(#bone)",
        ) +
        eye(281, 133, 4) +
        path(
          "M118 264 C76 218 112 176 149 190 M204 286 C300 315 357 256 322 219",
          "none",
          "var(--rim)",
          4,
        ) +
        Array.from({ length: 15 }, (_, i) =>
          circle(
            140 + i * 10,
            280 + Math.sin(i * 0.6) * 9,
            3,
            "none",
            "var(--gold)",
            0.8,
          ),
        ).join("") +
        (subject === "leviathan"
          ? Array.from({ length: 7 }, (_, i) =>
              path(
                `M${140 + i * 25} ${275 + Math.sin(i) * 10} l-9 -32 l23 13 Z`,
                "url(#gem)",
              ),
            ).join("")
          : "")
      );
    case "wraith":
      return (
        path(
          "M117 300 Q197 229 186 146 C180 71 292 61 300 143 Q288 212 362 292 L302 263 L311 307 L257 276 L225 314 L219 271 L163 300 L176 259 Z",
        ) +
        path(
          "M215 124 Q240 94 270 126 L261 169 L236 183 L217 159 Z",
          "var(--dark)",
        ) +
        eye(232, 139, 4) +
        eye(254, 139, 4) +
        path(
          "M204 191 Q145 143 126 215 L109 249 L153 228 M279 187 Q345 137 354 213 L371 245 L333 225",
          "none",
          "var(--gold)",
          9,
        ) +
        core(240, 214, 18) +
        Array.from({ length: 7 }, (_, i) =>
          path(
            `M${185 + i * 18} 296 q${i % 2 ? 24 : -24} -31 0 -70`,
            "none",
            "var(--rim)",
            1,
          ),
        ).join("")
      );
    case "demon":
      return (
        wing() +
        wing(-1) +
        horn() +
        horn(-1) +
        path(
          "M214 157 L183 169 L176 211 L200 233 L186 285 L219 288 L238 235 L258 288 L289 285 L276 230 L298 208 L288 167 L263 153 Z",
        ) +
        path(
          "M219 117 L240 105 L263 118 L259 157 L241 175 L218 155 Z",
          "url(#bone)",
        ) +
        eye(230, 137, 4) +
        eye(251, 137, 4) +
        path(
          "M208 181 L229 193 L241 178 L255 194 L277 181 L269 224 L214 224 Z",
          "url(#bone)",
        ) +
        core(241, 208, 13) +
        engraved(210, 250, 8, 8)
      );
    case "owl":
      return (
        path(
          "M164 178 L96 143 L128 206 L173 231 L204 270 L247 280 L285 263 L312 222 L370 172 L388 118 L304 169 L268 125 L209 128 Z",
          "url(#bone)",
        ) +
        path(
          "M199 132 L184 89 L223 113 L263 109 L294 83 L280 138 L293 179 L268 215 L221 216 L189 179 Z",
        ) +
        circle(219, 160, 25, "url(#bone)", "var(--rim)", 2) +
        circle(265, 160, 25, "url(#bone)", "var(--rim)", 2) +
        eye(219, 160, 6) +
        eye(265, 160, 6) +
        path("M232 177 L251 177 L240 194 Z", "var(--gold)") +
        path(
          "M106 152 L174 199 L221 266 M378 128 L307 199 L260 269 M212 224 L241 244 L276 218 M218 242 L241 261 L268 240",
          "none",
          "var(--gold)",
          1.5,
        )
      );
    case "knight":
      return (
        path(
          "M202 279 L213 211 L204 161 L185 156 L174 203 L152 193 L172 135 L211 127 L213 100 L239 79 L266 103 L270 132 L293 136 L322 201 L296 218 L272 185 L277 223 L291 280 L263 280 L241 237 L227 280 Z",
          "url(#bone)",
        ) +
        path("M218 111 L259 111 L255 144 L222 145 Z") +
        path(
          "M225 121 H251 M225 130 H249 M241 146 L224 180 L243 216 L259 181 Z",
          "none",
          "var(--gold)",
          2,
        ) +
        path("M298 153 L345 164 L338 226 L313 250 L288 222 Z") +
        core(315, 195, 15) +
        path(
          "M159 162 L144 104 L151 69 L163 101 L172 157 M139 162 L181 154",
          "url(#gem)",
        ) +
        engraved(206, 258, 9, 8)
      );
    case "whale":
      return (
        path(
          "M87 194 C99 121 209 110 285 157 L347 167 L373 133 L381 168 L411 176 L376 192 L360 223 L341 195 C285 233 186 259 114 229 Z",
        ) +
        path(
          "M192 228 L164 274 L231 240 M124 159 Q210 193 333 180 M123 207 Q189 228 280 217",
          "none",
          "var(--rim)",
          2,
        ) +
        eye(127, 189, 4) +
        circle(209, 180, 16, "none", "var(--gold)", 1) +
        Array.from({ length: 12 }, (_, i) =>
          path(
            `M${136 + i * 11} ${218 - Math.sin(i / 4) * 15} l4 15`,
            "none",
            "var(--gold)",
            0.8,
          ),
        ).join("") +
        path(
          "M148 132 Q153 106 145 90 M153 108 L172 92 M144 109 L126 101",
          "none",
          "var(--gold)",
          2,
        ) +
        core(230, 191, 13)
      );
    case "automaton":
      return (
        path(
          "M195 274 L205 220 L194 164 L163 189 L154 229 L139 223 L143 180 L182 144 L207 140 L205 102 L239 83 L273 102 L272 141 L295 146 L334 184 L339 226 L321 232 L309 190 L285 172 L278 222 L292 277 L264 282 L242 236 L223 282 Z",
        ) +
        circle(240, 120, 31, "url(#bone)", "var(--gold)", 3) +
        eye(228, 119, 5) +
        eye(252, 119, 5) +
        path("M227 136 H253 M214 158 H269 V211 H214 Z", "var(--dark)") +
        path(
          "M220 162 L242 166 L264 162 V198 L242 202 L220 198 Z",
          "url(#bone)",
        ) +
        engraved(222, 177, 6, 7) +
        engraved(222, 190, 6, 7) +
        circle(199, 160, 14, "none", "var(--rim)", 3) +
        circle(282, 159, 14, "none", "var(--rim)", 3) +
        core(242, 219, 9)
      );
    case "sphinx":
      return (
        wing(1, 0) +
        wing(-1, 0) +
        path(
          "M161 267 L174 208 L214 186 L209 138 L201 111 L240 77 L277 107 L270 143 L263 190 L311 211 L328 268 L292 275 L269 245 L212 246 L190 275 Z",
          "url(#bone)",
        ) +
        path("M211 113 H268 L260 157 L239 174 L219 153 Z") +
        eye(228, 132) +
        eye(253, 132) +
        path(
          "M204 108 L188 152 L210 193 L240 177 L269 192 L292 152 L274 107 M220 186 L241 212 L261 185 M216 225 H267",
          "none",
          "var(--gold)",
          3,
        ) +
        core(241, 219, 11)
      );
    case "budling":
      return (
        leaf(240, 184, 0, 1.7) +
        leaf(240, 188, 70, 1.5) +
        leaf(240, 190, -70, 1.5) +
        path(
          "M223 186 Q183 219 210 259 L193 279 L221 274 L240 248 L257 277 L286 281 L268 256 Q291 218 257 186 Z",
        ) +
        circle(239, 206, 35, "url(#petal)", "var(--gold)", 2) +
        eye(227, 205, 4) +
        eye(250, 205, 4) +
        path("M228 220 Q240 228 252 219", "none", "var(--gold)", 2) +
        petals(238, 169, 7, 0.45)
      );
    case "stag":
      return (
        path(
          "M136 259 L146 196 L201 183 L232 155 L250 128 L273 133 L285 157 L272 181 L253 193 L249 241 L261 283 L246 283 L227 243 L201 236 L179 280 L164 280 L172 230 L155 235 L151 279 L134 279 Z",
        ) +
        path(
          "M253 143 Q226 114 231 75 M233 98 L211 83 L208 61 M230 103 L248 80 L244 62 M270 142 Q305 109 298 67 M298 94 L317 78 L316 60 M298 105 L279 83 L282 63",
          "none",
          "var(--gold)",
          4,
        ) +
        eye(266, 154) +
        petals(213, 81, 5, 0.28) +
        petals(300, 68, 6, 0.3) +
        leaf(211, 206, -65, 0.5) +
        path(
          "M251 174 Q240 193 219 198 M161 214 Q184 220 204 211",
          "none",
          "var(--rim)",
          2,
        )
      );
    case "moth":
      return `<g>${path("M229 174 C192 98 81 78 104 165 C72 198 123 275 219 221 L240 197 L263 224 C363 267 408 193 378 165 C398 77 284 100 251 173 Z", "url(#petal)")}${circle(161, 161, 26, "url(#gem)", "var(--gold)", 3)}${circle(320, 161, 26, "url(#gem)", "var(--gold)", 3)}${path("M233 151 Q242 138 250 151 L253 221 L241 248 L229 222 Z")}${path("M237 150 Q214 112 221 104 M245 150 Q270 115 261 102", "none", "var(--gold)", 2)}${Array.from({ length: 9 }, (_, i) => leaf(141 + i * 23, 220 + Math.sin(i) * 20, i * 30, 0.25)).join("")}${petals(240, 193, 6, 0.5)}</g>`;
    case "treant":
      return (
        path(
          "M169 288 L191 249 L192 198 L153 219 L132 197 L161 169 L181 127 L205 121 L213 87 L235 115 L249 80 L265 121 L293 115 L307 158 L346 189 L331 218 L293 201 L290 252 L319 291 L274 283 L249 246 L226 282 Z",
        ) +
        path(
          "M211 145 L231 152 L240 173 L254 150 L276 143 M207 184 L231 201 L225 239 M274 184 L251 207 L260 241",
          "none",
          "var(--gold)",
          3,
        ) +
        eye(221, 165, 4) +
        eye(260, 164, 4) +
        Array.from({ length: 13 }, (_, i) =>
          leaf(159 + i * 14, 143 - Math.sin(i * 0.45) * 53, i * 31, 0.55),
        ).join("") +
        core(241, 207, 15)
      );
    case "dryad":
      return (
        petals(240, 174, 9, 1.5) +
        path(
          "M221 160 L239 148 L259 160 L264 186 L252 211 L275 268 L256 277 L241 240 L228 278 L207 270 L227 209 L213 186 Z",
          "url(#bone)",
        ) +
        path(
          "M218 178 L178 218 L162 207 M263 180 L301 212 L319 202",
          "none",
          "var(--gold)",
          8,
        ) +
        circle(240, 133, 25, "url(#bone)", "var(--rim)", 2) +
        eye(231, 132) +
        eye(250, 132) +
        petals(240, 108, 7, 0.55) +
        leaf(223, 248, -50, 0.9) +
        leaf(259, 250, 50, 0.9) +
        core(241, 190, 11)
      );
    case "jelly":
      return (
        path(
          "M158 171 C162 56 318 58 327 171 Q284 198 241 177 Q198 198 158 171 Z",
          "url(#gem)",
        ) +
        path(
          "M166 169 Q240 135 320 169 M178 164 Q182 99 226 91 M301 163 Q296 104 259 92",
          "none",
          "var(--light)",
          1.5,
        ) +
        Array.from({ length: 9 }, (_, i) =>
          path(
            `M${177 + i * 16} 179 C${135 + i * 22} 225 ${224 + i * 8} 247 ${151 + i * 21} 298`,
            "none",
            i % 2 ? "var(--gold)" : "var(--rim)",
            i % 3 ? 3 : 6,
          ),
        ).join("") +
        eye(222, 146, 5) +
        eye(259, 146, 5) +
        core(241, 111, 11)
      );
    case "cat":
      return (
        path(
          "M167 278 C145 256 181 221 205 217 L204 179 L182 143 L177 97 L216 118 L255 117 L296 91 L289 140 L272 178 L271 217 Q305 236 290 277 L263 280 L247 246 L225 277 Z",
        ) +
        path(
          "M195 233 C117 235 98 184 142 168 Q177 152 143 132",
          "none",
          "var(--gold)",
          15,
        ) +
        eye(214, 151, 6) +
        eye(263, 151, 6) +
        eye(239, 128, 5) +
        path(
          "M227 166 L247 166 L237 177 M213 182 Q238 193 261 180",
          "none",
          "var(--rim)",
          2,
        ) +
        path(
          "M208 218 L239 231 L271 217 M224 249 L238 232 L251 250",
          "none",
          "var(--gold)",
          2,
        ) +
        core(239, 206, 11)
      );
    case "chimera":
      return (
        wing(1, 18) +
        path(
          "M169 262 L181 210 L203 186 L186 144 L214 111 L237 126 L261 108 L289 141 L273 188 L304 211 L314 268 L288 275 L264 234 L216 235 L194 275 Z",
        ) +
        path(
          "M197 142 L214 130 L231 153 L218 175 L196 166 Z M246 147 L266 126 L284 147 L273 175 L254 171 Z",
          "url(#bone)",
        ) +
        eye(215, 151, 4) +
        eye(269, 150, 4) +
        horn(-1) +
        path(
          "M303 233 Q366 192 343 150 L325 138 L350 117 L366 144",
          "none",
          "var(--rim)",
          8,
        ) +
        Array.from({ length: 8 }, (_, i) =>
          path(
            `M${200 + i * 11} ${212 + (i % 2) * 10} l10 -23 l7 29 Z`,
            "url(#gem)",
          ),
        ).join("")
      );
    case "bird":
      return (
        path(
          "M237 156 L189 141 L101 85 L132 156 L82 141 L133 204 L191 215 L214 254 L203 289 L239 274 L277 292 L265 253 L294 215 L347 197 L395 135 L350 152 L382 85 L294 143 L252 155 L256 120 L274 109 L248 99 L225 113 Z",
          "url(#gem)",
        ) +
        eye(241, 118, 4) +
        path(
          "M238 173 L139 135 M238 185 L134 184 M249 174 L348 132 M249 186 L346 180 M233 220 L229 267 M248 220 L252 269",
          "none",
          "var(--gold)",
          2,
        ) +
        Array.from({ length: 12 }, (_, i) =>
          path(
            `M${108 + i * 23} ${112 + Math.sin(i) * 20} l-8 -23 l16 7 Z`,
            "url(#bone)",
          ),
        ).join("") +
        core(242, 198, 16)
      );
    case "beetle":
      return (
        path(
          "M190 253 Q157 181 202 140 L239 118 L280 141 Q323 185 289 253 L242 280 Z",
        ) +
        circle(240, 190, 53, "url(#bone)", "var(--gold)", 3) +
        circle(240, 190, 35, "url(#gem)", "var(--rim)", 3) +
        path(
          "M241 138 V242 M205 132 L189 106 L203 88 M274 132 L292 107 L279 90 M188 166 L153 144 L136 166 M184 199 L143 200 L129 228 M192 236 L154 256 L158 283 M291 164 L327 140 L345 162 M295 197 L337 200 L354 227 M289 232 L329 257 L325 282",
          "none",
          "var(--gold)",
          5,
        ) +
        eye(224, 134, 4) +
        eye(256, 134, 4) +
        engraved(203, 192, 10, 8)
      );
    case "fox":
      return (
        path(
          "M183 258 Q129 266 98 228 Q139 201 172 218 L188 194 L202 146 L196 99 L226 124 L263 123 L293 97 L284 147 L276 192 L295 234 L279 272 L256 273 L241 231 L224 271 L199 272 Z",
          "url(#bone)",
        ) +
        path(
          "M203 148 L226 157 L240 180 L263 158 L279 148 L267 186 L241 204 L213 185 Z",
        ) +
        eye(222, 163) +
        eye(260, 163) +
        path("M235 183 L248 183 L241 193 Z", "var(--gold)") +
        path(
          "M105 228 Q142 223 165 246 M212 215 L241 229 L269 215",
          "none",
          "var(--gold)",
          3,
        ) +
        path(
          "M240 124 C222 102 252 83 240 67 C270 90 263 115 240 124 Z",
          "url(#gem)",
        ) +
        core(242, 222, 9)
      );
    case "ray":
      return (
        path(
          "M238 138 C186 135 147 205 77 191 C115 243 185 277 237 226 C289 279 365 246 405 187 C335 203 292 131 245 138 L256 108 L240 98 L226 112 Z",
          "url(#gem)",
        ) +
        path(
          "M239 218 Q212 271 246 300 Q278 323 272 278",
          "none",
          "var(--gold)",
          5,
        ) +
        path(
          "M237 165 L122 208 L200 234 M248 165 L363 210 L282 235",
          "none",
          "var(--light)",
          1,
        ) +
        eye(226, 155, 4) +
        eye(255, 155, 4) +
        Array.from({ length: 13 }, (_, i) =>
          circle(
            118 + i * 20,
            212 + Math.sin(i * 0.53) * 17,
            2,
            "var(--gold)",
            "none",
          ),
        ).join("") +
        core(240, 189, 14)
      );
    default:
      throw new Error(`Unknown creature ${subject}`);
  }
}
function artifact(subject) {
  const base =
    path("M155 292 L174 274 H307 L327 292 Z", "url(#bone)") +
    circle(240, 187, 97, "none", "var(--rim)", 0.8);
  const engrave = engraved(193, 282, 13, 8);
  const shapes = {
    censer:
      path("M191 164 Q240 134 288 164 L274 215 Q239 252 205 214 Z") +
      path(
        "M188 165 H291 M240 92 L198 162 M240 92 L280 162 M241 90 V67 M211 152 Q175 121 218 96 M246 145 Q286 107 253 79 M269 151 Q312 129 287 104",
        "none",
        "var(--gold)",
        2,
      ) +
      core(239, 199, 16),
    hourglass:
      path(
        "M198 92 H283 L271 123 Q243 165 272 204 L282 254 H197 L207 206 Q238 163 207 126 Z",
        "url(#gem)",
      ) +
      path("M186 85 H295 V100 H186 Z M186 252 H295 V268 H186 Z", "url(#bone)") +
      path(
        "M203 113 L240 159 L276 114 M207 244 L240 199 L274 244 Z",
        "var(--gold)",
      ) +
      circle(240, 180, 3, "var(--light)"),
    book:
      path(
        "M137 119 Q197 97 240 130 Q283 98 344 121 L332 248 Q278 234 240 262 Q190 233 148 249 Z",
        "url(#bone)",
      ) +
      path(
        "M239 132 V257 M154 136 Q194 120 226 142 M255 143 Q291 122 327 138",
        "none",
        "var(--gold)",
        2,
      ) +
      engraved(161, 159, 8, 8) +
      engraved(160, 179, 8, 8) +
      engraved(161, 198, 8, 8) +
      core(286, 189, 26) +
      path("M220 115 L235 62 L250 113", "url(#gem)"),
    astrolabe:
      circle(240, 176, 78, "url(#gem)", "var(--gold)", 4) +
      circle(240, 176, 59, "none", "var(--light)", 1) +
      circle(240, 176, 35, "none", "var(--gold)", 3) +
      path(
        "M160 176 H320 M240 95 V255 M186 123 L295 230 M185 229 L295 122",
        "none",
        "var(--rim)",
        1,
      ) +
      path("M241 77 V62 M239 254 L218 278 H266 Z", "url(#bone)") +
      core(240, 176, 14),
    crown:
      path(
        "M156 172 L172 233 Q240 262 309 233 L327 173 L286 198 L280 138 L242 192 L203 137 L196 199 Z",
        "url(#bone)",
      ) +
      Array.from({ length: 7 }, (_, i) =>
        leaf(180 + i * 20, 223 - Math.sin(i) * 8, i * 35, 0.6),
      ).join("") +
      core(241, 220, 17),
    chalice:
      path(
        "M172 112 H307 Q307 189 254 204 V246 L281 260 H199 L225 246 V204 Q172 189 172 112 Z",
        "url(#bone)",
      ) +
      path(
        "M176 125 Q241 150 304 125 M198 175 Q241 201 283 176",
        "none",
        "var(--gold)",
        2,
      ) +
      core(241, 144, 20) +
      petals(241, 94, 7, 0.45),
    mask:
      path(
        "M168 117 L204 132 L240 106 L279 132 L313 114 L302 208 L268 253 L240 273 L207 251 L176 207 Z",
        "url(#bone)",
      ) +
      path(
        "M187 165 Q212 145 233 170 Q208 186 187 165 M250 169 Q276 144 296 161 Q274 185 250 169 M208 215 Q242 246 278 211 Q246 263 208 215",
        "var(--dark)",
      ) +
      eye(212, 165, 4) +
      eye(275, 164, 4) +
      core(242, 133, 10),
    prism:
      path("M240 72 L317 171 L278 262 L200 262 L165 169 Z", "url(#gem)") +
      path(
        "M240 72 L225 165 L165 169 M225 165 L278 262 M225 165 L317 171 M225 165 L200 262 M257 118 L277 174 L260 210 L231 219 L218 186 Z",
        "none",
        "var(--light)",
        2,
      ) +
      path(
        "M128 214 L157 202 L146 237 Z M335 126 L365 99 L357 149 Z M268 291 L287 307 L252 321 Z",
        "url(#bone)",
      ) +
      core(242, 176, 16),
    lantern:
      path("M202 126 L190 239 L240 259 L289 239 L277 126 Z", "url(#gem)") +
      path(
        "M184 125 L207 99 H272 L293 125 Z M186 239 L201 264 H279 L294 239 Z",
        "url(#bone)",
      ) +
      path(
        "M222 99 V77 Q240 53 258 77 V99 M205 135 L213 236 M276 135 L269 237 M240 131 V249",
        "none",
        "var(--gold)",
        3,
      ) +
      path(
        "M241 227 C199 208 250 177 238 153 C279 182 274 217 241 227 Z",
        "var(--gold)",
      ),
    compass:
      circle(240, 185, 79, "url(#bone)", "var(--gold)", 4) +
      circle(240, 185, 63, "var(--dark)", "var(--rim)", 2) +
      path(
        "M240 119 L251 175 L294 185 L251 195 L240 253 L228 197 L184 185 L228 175 Z",
        "url(#gem)",
      ) +
      path(
        "M238 100 V76 Q256 57 270 77 L264 94 M181 128 L164 111 M298 130 L318 110",
        "none",
        "var(--gold)",
        3,
      ) +
      core(240, 185, 12),
  };
  if (!shapes[subject]) throw new Error(`Unknown artifact ${subject}`);
  return base + shapes[subject] + engrave;
}
function spell(subject, n) {
  const sigil =
    circle(240, 184, 91, "none", "var(--gold)", 1) +
    circle(240, 184, 103, "none", "var(--rim)", 0.7) +
    engraved(179, 282, 17, 8);
  const shapes = {
    fissure:
      path(
        "M83 286 L206 215 L193 166 L247 130 L227 83 L292 128 L266 172 L291 212 L358 278 L271 238 L247 201 L223 246 Z",
        "url(#gem)",
      ) +
      path(
        "M235 102 L257 137 L230 173 L256 211 L281 245",
        "none",
        "var(--light)",
        4,
      ),
    pact:
      path(
        "M154 209 Q139 183 162 158 L195 150 L230 184 L244 149 L278 136 L305 160 L321 202 L275 239 L241 217 L210 246 Z",
        "url(#bone)",
      ) +
      path(
        "M184 165 L223 212 M202 151 L239 194 M253 157 L276 195 L252 222 M304 174 L279 210",
        "none",
        "var(--gold)",
        3,
      ) +
      core(244, 191, 25) +
      path(
        "M239 134 C216 111 247 89 239 68 C268 96 274 124 239 134 Z",
        "url(#gem)",
      ),
    pyre:
      path(
        "M133 271 C116 235 170 204 148 170 C199 205 183 138 218 111 C196 158 245 151 242 85 C310 126 278 176 319 156 C296 195 359 229 342 270 Z",
        "url(#gem)",
      ) +
      path(
        "M188 268 C171 231 238 207 229 163 C271 210 295 226 286 267 Z",
        "var(--gold)",
      ) +
      path("M154 280 H328 M172 291 H310", "none", "var(--rim)", 3),
    reading:
      path(
        "M126 173 Q186 137 237 177 Q294 132 354 171 L337 254 Q282 231 239 264 Q180 232 141 254 Z",
        "url(#bone)",
      ) +
      path("M237 177 V260", "none", "var(--gold)", 3) +
      Array.from({ length: 5 }, (_, i) =>
        path(
          `M${171 + i * 30} ${131 - (i % 2) * 17} l-7 -27 l21 -12 l8 28 Z`,
          "url(#bone)",
        ),
      ).join("") +
      core(244, 101, 18) +
      engraved(158, 202, 9, 8) +
      engraved(263, 202, 9, 8),
    sigil:
      circle(240, 184, 67, "url(#gem)", "var(--gold)", 3) +
      path(
        "M239 113 L263 166 L311 183 L264 205 L240 256 L218 205 L169 185 L217 164 Z",
        "none",
        "var(--light)",
        3,
      ) +
      path("M240 140 V184 L272 207", "none", "var(--gold)", 5) +
      circle(240, 184, 9, "var(--light)"),
    lance:
      path(
        "M137 280 L269 123 L267 84 L302 108 L340 113 L303 133 L158 298 Z",
        "url(#gem)",
      ) +
      path(
        "M156 281 L303 113 M202 218 L177 199 M247 166 L269 186",
        "none",
        "var(--gold)",
        3,
      ) +
      core(287, 127, 20) +
      path("M304 89 L336 58 M320 134 L368 147", "none", "var(--rim)", 2),
    dew:
      leaf(241, 270, 0, 2.9) +
      path(
        "M240 113 C228 147 196 173 198 205 C200 258 280 258 282 204 C283 173 251 142 240 113 Z",
        "url(#gem)",
      ) +
      core(240, 210, 26) +
      Array.from({ length: 6 }, (_, i) =>
        circle(160 + i * 32, 103 + Math.sin(i) * 30, 4, "var(--light)", "none"),
      ).join(""),
    roots:
      path(
        "M239 117 V225 M239 165 L200 146 L176 173 L144 159 M240 191 L280 168 L307 188 L339 170 M239 224 L210 253 L173 259 L154 283 M210 252 L226 286 M240 222 L266 253 L306 259 L327 284 M266 253 L251 287",
        "none",
        "var(--gold)",
        9,
      ) +
      leaf(240, 157, -25, 1.6) +
      leaf(250, 152, 55, 1.4) +
      petals(240, 119, 7, 0.9),
    petals:
      Array.from({ length: 15 }, (_, i) =>
        leaf(
          240 + Math.cos(i * 2.4) * (30 + i * 6),
          185 + Math.sin(i * 2.4) * (20 + i * 5),
          i * 39,
          0.45 + (i % 3) * 0.15,
        ),
      ).join("") + core(240, 185, 29),
    comet:
      path("M112 283 Q151 177 338 87 Q282 189 183 267 Z", "url(#gem)") +
      path(
        "M133 269 Q203 193 308 119 M157 268 Q236 235 333 137 M122 250 Q183 151 294 95",
        "none",
        "var(--gold)",
        2,
      ) +
      core(167, 242, 27) +
      path("M154 225 L178 223 L189 244 L172 263 L151 254 Z", "url(#bone)"),
    shape:
      path(
        "M147 229 L173 135 L221 111 L249 153 L282 114 L333 148 L317 239 L278 264 L239 231 L199 267 Z",
        "url(#gem)",
      ) +
      path(
        "M174 139 L201 182 L149 227 L214 226 L239 231 L257 195 L316 237 M249 153 L257 195 L331 148 M201 182 L248 153 M221 111 L214 226",
        "none",
        "var(--light)",
        2,
      ) +
      eye(210, 171, 5) +
      eye(283, 172, 5),
    fracture:
      path(
        "M115 202 L200 157 L180 101 L237 133 L268 79 L278 144 L356 138 L312 188 L364 246 L289 227 L277 295 L233 248 L181 286 L192 224 Z",
        "url(#gem)",
      ) +
      circle(244, 191, 45, "url(#bone)", "var(--light)", 2) +
      path(
        "M247 149 L230 180 L250 193 L231 221 M244 171 V194 L267 207",
        "none",
        "var(--dark)",
        3,
      ) +
      core(245, 192, 9),
    unbinding:
      path(
        "M175 172 Q125 120 177 100 Q233 86 240 147 L245 221 Q244 276 299 268 Q352 246 302 214 M210 156 L190 192 M221 174 L198 209 M265 184 L286 159 M278 198 L304 174",
        "none",
        "var(--gold)",
        12,
      ) +
      path("M194 235 L284 137", "none", "var(--light)", 4) +
      core(240, 185, 18),
    pulse:
      Array.from({ length: 5 }, (_, i) =>
        circle(
          240,
          185,
          28 + i * 17,
          "none",
          i % 2 ? "var(--rim)" : "var(--gold)",
          i % 2 ? 1 : 2,
        ),
      ).join("") +
      path(
        "M98 188 H186 L209 161 L231 218 L252 147 L273 192 H384",
        "none",
        "var(--light)",
        5,
      ) +
      core(241, 185, 20),
  };
  if (!shapes[subject]) throw new Error(`Unknown spell ${subject} ${n}`);
  return sigil + shapes[subject];
}
function illustrate(row, index) {
  const [dark, shade, rim, gold, light] = palettes[row.affinity];
  const stars = Array.from({ length: 34 }, (_, i) => {
    const x = (i * 137 + index * 37) % 480,
      y = (i * 71 + index * 23) % 300;
    return circle(x, y, i % 6 === 0 ? 1.8 : 0.7, "var(--light)", "none");
  }).join("");
  const columns = Array.from({ length: 7 }, (_, i) =>
    path(
      `M${i * 80 - 20} 315 V${120 + ((i * 31 + index * 7) % 70)} l20 -36 l20 36 V315`,
      "var(--shade)",
      "var(--rim)",
      0.5,
    ),
  ).join("");
  let setting = columns;
  if (row.affinity === "ruin")
    setting += Array.from({ length: 9 }, (_, i) =>
      path(
        `M${i * 64 - 20} 344 l18 -64 l10 33 l28 -96 l8 127 Z`,
        "var(--dark)",
        "var(--rim)",
        0.7,
      ),
    ).join("");
  if (row.affinity === "knowledge")
    setting +=
      path(
        "M38 319 V105 Q240 -64 442 105 V319 M58 319 V110 Q240 -29 422 110 V319",
        "none",
        "var(--gold)",
        1.1,
      ) +
      path(
        "M80 67 L132 39 L193 64 L239 22 L291 57 L349 36 L400 75",
        "none",
        "var(--rim)",
        1,
      ) +
      Array.from({ length: 9 }, (_, i) =>
        circle(80 + i * 40, 60 + Math.sin(i) * 24, 3, "var(--gold)", "none"),
      ).join("");
  if (row.affinity === "bloom")
    setting +=
      path(
        "M0 300 Q98 204 55 107 L17 52 M480 300 Q375 203 424 108 L465 50",
        "none",
        "var(--rim)",
        4,
      ) +
      Array.from({ length: 12 }, (_, i) =>
        leaf(
          i % 2 ? 440 - i * 2 : 30 + i * 3,
          91 + i * 17,
          i % 2 ? -60 : 60,
          0.7,
        ),
      ).join("");
  if (row.affinity === "chaos")
    setting +=
      Array.from({ length: 12 }, (_, i) =>
        path(
          `M${30 + i * 38} ${55 + (i % 3) * 20} l-14 -34 l31 15 l-7 29 Z`,
          "url(#gem)",
          "var(--rim)",
          0.8,
        ),
      ).join("") +
      path(
        "M20 175 L74 110 L54 70 M431 35 L405 113 L458 180 L411 231",
        "none",
        "var(--gold)",
        1,
      );
  const subject =
    row.kind === "creature"
      ? creature(row.subject)
      : row.kind === "artifact"
        ? artifact(row.subject)
        : spell(row.subject, index);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 360" role="img" aria-labelledby="title desc" style="--dark:${dark};--shade:${shade};--rim:${rim};--gold:${gold};--light:${light}"><title id="title">${row.name}</title><desc id="desc">Gravura vetorial original: ${row.subject}. ${row.flavor}</desc><defs><radialGradient id="sky"><stop stop-color="${shade}"/><stop offset="1" stop-color="${dark}"/></radialGradient><linearGradient id="body" x2=".8" y2="1"><stop stop-color="${rim}"/><stop offset=".35" stop-color="${shade}"/><stop offset="1" stop-color="${dark}"/></linearGradient><linearGradient id="bone" x2=".7" y2="1"><stop stop-color="${light}"/><stop offset=".5" stop-color="${gold}"/><stop offset="1" stop-color="${shade}"/></linearGradient><linearGradient id="gem" x2=".8" y2="1"><stop stop-color="${light}"/><stop offset=".25" stop-color="${rim}"/><stop offset=".75" stop-color="${shade}"/><stop offset="1" stop-color="${dark}"/></linearGradient><linearGradient id="petal" x2=".4" y2="1"><stop stop-color="${light}"/><stop offset=".3" stop-color="${rim}"/><stop offset="1" stop-color="${shade}"/></linearGradient><radialGradient id="glow"><stop stop-color="${gold}" stop-opacity=".55"/><stop offset="1" stop-color="${rim}" stop-opacity="0"/></radialGradient><pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 6L6 0" stroke="${light}" stroke-width=".5" opacity=".12"/></pattern></defs><rect width="480" height="360" fill="url(#sky)"/>${stars}<g opacity=".28">${setting}</g><ellipse cx="240" cy="310" rx="183" ry="22" fill="${dark}"/><ellipse cx="240" cy="290" rx="128" ry="20" fill="url(#glow)"/>${circle(240, 175, 127, "none", "var(--rim)", 0.7)}${circle(240, 175, 135, "none", "var(--gold)", 0.5)}<g>${subject}</g><path d="M12 332 Q120 308 240 335 Q356 308 468 330" fill="none" stroke="${gold}" stroke-width=".6"/><g opacity=".6">${Array.from({ length: 25 }, (_, i) => path(`M${15 + i * 19} ${323 + (i % 3) * 5} l5 -5`, "none", "var(--gold)", 0.6)).join("")}</g><rect width="480" height="360" fill="url(#hatch)" pointer-events="none"/><rect x="9" y="9" width="462" height="342" rx="70" fill="none" stroke="${gold}" stroke-opacity=".25"/></svg>\n`;
}
const manifest = rows.map((row, index) => {
  const svg = illustrate(row, index),
    target = `public/assets/duel/${row.id}.svg`;
  if (process.argv.includes("--check")) {
    if (fs.readFileSync(target, "utf8") !== svg)
      throw new Error(`Stale art ${target}`);
  } else fs.writeFileSync(target, svg);
  return {
    ...row,
    file: target,
    bytes: Buffer.byteLength(svg),
    sha256: crypto.createHash("sha256").update(svg).digest("hex"),
  };
});
const material =
  JSON.stringify(
    {
      version: 1,
      author: "Biblioteca Viva · BF-5.6E",
      source: "scripts/generate-duel-art.mjs",
      license:
        "Original project assets; follows repository license. No third-party art.",
      illustrations: manifest,
    },
    null,
    2,
  ) + "\n";
if (process.argv.includes("--check")) {
  if (fs.readFileSync("assets/duel/source/manifest.json", "utf8") !== material)
    throw new Error("Stale manifest");
} else fs.writeFileSync("assets/duel/source/manifest.json", material);
console.log(
  `${rows.length} distinct vector illustrations verified; ${manifest.reduce((n, r) => n + r.bytes, 0)} bytes.`,
);
