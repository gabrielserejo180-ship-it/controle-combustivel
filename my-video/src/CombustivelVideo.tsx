import {
  AbsoluteFill,
  Series,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import React from "react";

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  navy900: "#0B1626",
  navy800: "#0F1F33",
  navy700: "#15304E",
  accent: "#4FA8F0",
  accentSoft: "rgba(79,168,240,0.16)",
  white: "#FFFFFF",
  gray200: "#1D2C40",
  gray300: "#2B3D55",
  ink: "#E6EDF6",
  inkSoft: "#8DA0B8",
  green: "#3FCB95",
  greenSoft: "rgba(63,203,149,0.14)",
  amber: "#F0B65C",
  red: "#F2706B",
  redSoft: "rgba(242,112,107,0.14)",
  surface: "#121E30",
  surface2: "#182840",
  textHeading: "#F2F6FB",
  textLabel: "#8FB9E8",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function fadeIn(frame: number, start = 0, end = 20) {
  return interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

function slideUp(frame: number, start = 0, end = 24, px = 40) {
  return interpolate(frame, [start, end], [px, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
}

// ── Shared wrapper ────────────────────────────────────────────────────────────
const SceneWrapper: React.FC<{ children: React.ReactNode; bg?: string }> = ({
  children,
  bg = C.navy900,
}) => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(145deg, ${bg} 0%, ${C.navy800} 100%)`,
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      overflow: "hidden",
    }}
  >
    {children}
  </AbsoluteFill>
);

// ── Fuel icon SVG ─────────────────────────────────────────────────────────────
const FuelIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 80,
  color = C.accent,
}) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <circle cx="20" cy="20" r="19" stroke={color} strokeWidth="2" />
    <path
      d="M13 27V15a2 2 0 012-2h6a2 2 0 012 2v12M13 27h10M13 21h7m4 6h2a2 2 0 002-2v-5l-2-4h-3"
      stroke="#FFFFFF"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="16" cy="27" r="1.4" fill={color} />
    <circle cx="22" cy="27" r="1.4" fill={color} />
  </svg>
);

// ── KPI Card ──────────────────────────────────────────────────────────────────
const KpiCard: React.FC<{
  label: string;
  value: string;
  icon: React.ReactNode;
  color?: string;
  delay?: number;
  frame: number;
}> = ({ label, value, icon, color = C.accent, delay = 0, frame }) => {
  const { fps } = useVideoConfig();
  const s = spring({ fps, frame: frame - delay, config: { damping: 14 } });
  const opacity = interpolate(frame - delay, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.gray200}`,
        borderRadius: 14,
        padding: "18px 20px",
        opacity,
        transform: `translateY(${interpolate(s, [0, 1], [30, 0])}px) scale(${interpolate(s, [0, 1], [0.95, 1])})`,
        flex: 1,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 9,
          background: `${color}22`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
          color,
        }}
      >
        {icon}
      </div>
      <div
        style={{
          fontSize: 11,
          color: C.inkSoft,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 22,
          fontWeight: 700,
          color: C.textHeading,
          marginTop: 6,
        }}
      >
        {value}
      </div>
    </div>
  );
};

// ── Chart bar ─────────────────────────────────────────────────────────────────
const ChartBar: React.FC<{
  label: string;
  pct: number;
  color?: string;
  frame: number;
  delay?: number;
}> = ({ label, pct, color = C.accent, frame, delay = 0 }) => {
  const { fps } = useVideoConfig();
  const s = spring({ fps, frame: frame - delay, config: { damping: 18 } });
  const h = interpolate(s, [0, 1], [0, pct]);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        flex: 1,
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: C.inkSoft,
          fontFamily: "monospace",
          marginBottom: 4,
        }}
      >
        R$ {Math.round(pct * 25)}
      </div>
      <div
        style={{
          width: "100%",
          background: C.surface2,
          borderRadius: 6,
          height: 120,
          display: "flex",
          alignItems: "flex-end",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "100%",
            height: `${h}%`,
            background: color,
            borderRadius: "6px 6px 0 0",
            opacity: 0.85,
          }}
        />
      </div>
      <div style={{ fontSize: 11, color: C.inkSoft }}>{label}</div>
    </div>
  );
};

// ── Table Row ─────────────────────────────────────────────────────────────────
const TableRow: React.FC<{
  cells: string[];
  badge?: { text: string; color: string; bg: string };
  frame: number;
  delay?: number;
}> = ({ cells, badge, frame, delay = 0 }) => {
  const op = fadeIn(frame, delay, delay + 15);
  const tx = slideUp(frame, delay, delay + 15, 20);
  return (
    <div
      style={{
        display: "flex",
        gap: 0,
        padding: "12px 16px",
        borderBottom: `1px solid ${C.gray200}`,
        opacity: op,
        transform: `translateY(${tx}px)`,
        alignItems: "center",
      }}
    >
      {cells.map((c, i) => (
        <div
          key={i}
          style={{
            flex: i === 0 ? 2 : 1,
            fontSize: 13,
            color: i === 0 ? C.textHeading : C.ink,
            fontWeight: i === 0 ? 600 : 400,
          }}
        >
          {c}
        </div>
      ))}
      {badge && (
        <div
          style={{
            background: badge.bg,
            color: badge.color,
            borderRadius: 20,
            padding: "3px 10px",
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          {badge.text}
        </div>
      )}
    </div>
  );
};

// ── Progress bar ──────────────────────────────────────────────────────────────
const ProgressBar: React.FC<{
  pct: number;
  frame: number;
  delay?: number;
  color?: string;
}> = ({ pct, frame, delay = 0, color = C.accent }) => {
  const { fps } = useVideoConfig();
  const s = spring({ fps, frame: frame - delay, config: { damping: 20 } });
  const w = interpolate(s, [0, 1], [0, pct]);
  return (
    <div
      style={{
        height: 8,
        background: C.surface2,
        borderRadius: 6,
        overflow: "hidden",
        flex: 1,
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${w}%`,
          background: color,
          borderRadius: 6,
        }}
      />
    </div>
  );
};

// ── Section title ─────────────────────────────────────────────────────────────
const SectionTitle: React.FC<{
  title: string;
  sub: string;
  frame: number;
  accent?: string;
}> = ({ title, sub, frame, accent = C.accent }) => (
  <div style={{ marginBottom: 32 }}>
    <div
      style={{
        display: "inline-block",
        background: `${accent}22`,
        color: accent,
        borderRadius: 20,
        padding: "4px 14px",
        fontSize: 12,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "1px",
        marginBottom: 12,
        opacity: fadeIn(frame, 0, 15),
      }}
    >
      {sub}
    </div>
    <div
      style={{
        fontSize: 42,
        fontWeight: 800,
        color: C.textHeading,
        fontFamily: "'Sora', 'Inter', sans-serif",
        opacity: fadeIn(frame, 5, 25),
        transform: `translateY(${slideUp(frame, 5, 25, 24)}px)`,
        lineHeight: 1.15,
      }}
    >
      {title}
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
// SCENE 1 — INTRO (90f)
// ══════════════════════════════════════════════════════════════════════════════
const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ fps, frame, config: { damping: 12 } });
  const logoOp = fadeIn(frame, 0, 18);

  const titleOp = fadeIn(frame, 20, 40);
  const titleY = slideUp(frame, 20, 40, 30);

  const subOp = fadeIn(frame, 35, 55);
  const subY = slideUp(frame, 35, 55, 20);

  const tagOp = fadeIn(frame, 50, 70);

  // Animated ring
  const ringScale = interpolate(frame, [0, 30], [0.6, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.5)),
  });

  return (
    <SceneWrapper>
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.accentSoft} 0%, transparent 70%)`,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          opacity: 0.6,
        }}
      />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
        }}
      >
        {/* Logo */}
        <div
          style={{
            opacity: logoOp,
            transform: `scale(${interpolate(logoScale, [0, 1], [0.5, 1])})`,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              border: `3px solid ${C.accent}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: `${C.accentSoft}`,
              transform: `scale(${ringScale})`,
              boxShadow: `0 0 40px ${C.accent}44`,
            }}
          >
            <FuelIcon size={72} />
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            opacity: titleOp,
            transform: `translateY(${titleY}px)`,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "'Sora', 'Inter', sans-serif",
              fontSize: 72,
              fontWeight: 800,
              color: C.textHeading,
              letterSpacing: "-1px",
              lineHeight: 1,
            }}
          >
            Combustível
          </div>
        </div>

        {/* Subtitle */}
        <div
          style={{
            opacity: subOp,
            transform: `translateY(${subY}px)`,
            marginTop: 12,
          }}
        >
          <div
            style={{
              fontSize: 18,
              color: C.accent,
              fontWeight: 600,
              letterSpacing: "4px",
              textTransform: "uppercase",
            }}
          >
            Painel de Controle
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            opacity: tagOp,
            marginTop: 36,
            textAlign: "center",
            maxWidth: 600,
          }}
        >
          <div
            style={{
              fontSize: 20,
              color: C.inkSoft,
              lineHeight: 1.6,
            }}
          >
            Gerencie os gastos com combustível da sua equipe
            <br />
            com dados em tempo real
          </div>
        </div>
      </AbsoluteFill>

      {/* Bottom accent line */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, transparent, ${C.accent}, transparent)`,
          opacity: fadeIn(frame, 60, 90),
        }}
      />
    </SceneWrapper>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// SCENE 2 — DASHBOARD (270f)
// ══════════════════════════════════════════════════════════════════════════════
const DashboardScene: React.FC = () => {
  const frame = useCurrentFrame();

  const kpis = [
    { label: "Total no mês", value: "R$ 8.420", color: C.accent },
    { label: "Gasto hoje", value: "R$ 340", color: C.green },
    { label: "Abastecimentos", value: "147", color: C.amber },
    { label: "Funcionários", value: "12", color: C.accent },
    { label: "Maior consumo", value: "Carlos — R$ 1.2k", color: C.red },
    { label: "Média/funcionário", value: "R$ 701", color: C.accent },
  ];

  const bars = [
    { label: "Jan", pct: 62 },
    { label: "Fev", pct: 78 },
    { label: "Mar", pct: 55 },
    { label: "Abr", pct: 88 },
    { label: "Mai", pct: 70 },
    { label: "Jun", pct: 95 },
  ];

  const sidebarOp = fadeIn(frame, 0, 20);

  return (
    <SceneWrapper>
      <AbsoluteFill style={{ display: "flex", flexDirection: "row" }}>
        {/* Sidebar */}
        <div
          style={{
            width: 220,
            background: `linear-gradient(180deg, ${C.navy900} 0%, ${C.navy700} 100%)`,
            flexShrink: 0,
            opacity: sidebarOp,
            display: "flex",
            flexDirection: "column",
            padding: "24px 12px",
            gap: 4,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "0 10px",
              marginBottom: 24,
            }}
          >
            <FuelIcon size={34} />
            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: C.white,
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                Combustível
              </div>
              <div style={{ fontSize: 10, color: "#9FB6D6" }}>
                PAINEL DE CONTROLE
              </div>
            </div>
          </div>
          {[
            { label: "Dashboard", active: true },
            { label: "Funcionários", active: false },
            { label: "Novo Abastecimento", active: false },
            { label: "Histórico", active: false },
            { label: "Relatórios", active: false },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                padding: "11px 14px",
                borderRadius: 10,
                background: item.active ? C.accent : "transparent",
                color: item.active ? C.white : "#C6D6EC",
                fontSize: 13,
                fontWeight: 500,
                boxShadow: item.active
                  ? "0 4px 14px rgba(47,134,214,0.4)"
                  : "none",
              }}
            >
              {item.label}
            </div>
          ))}
        </div>

        {/* Main content */}
        <div
          style={{
            flex: 1,
            padding: "28px 32px",
            overflowY: "hidden",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* Topbar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              opacity: fadeIn(frame, 5, 25),
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: C.textHeading,
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                Dashboard
              </div>
              <div style={{ fontSize: 13, color: C.inkSoft }}>
                Visão geral do consumo de combustível
              </div>
            </div>
            <div
              style={{
                background: C.greenSoft,
                color: C.green,
                borderRadius: 20,
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              ● Conectado
            </div>
          </div>

          {/* KPI Cards */}
          <div style={{ display: "flex", gap: 14 }}>
            {kpis.map((k, i) => (
              <KpiCard
                key={k.label}
                label={k.label}
                value={k.value}
                color={k.color}
                delay={i * 8}
                frame={frame}
                icon={
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M12 2v20M5 6h14M5 18h14" />
                  </svg>
                }
              />
            ))}
          </div>

          {/* Charts row */}
          <div style={{ display: "flex", gap: 18, flex: 1 }}>
            {/* Evolução chart */}
            <div
              style={{
                flex: 1.4,
                background: C.surface,
                border: `1px solid ${C.gray200}`,
                borderRadius: 14,
                padding: 20,
                opacity: fadeIn(frame, 30, 50),
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: C.textHeading,
                  marginBottom: 16,
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                Evolução de gastos
              </div>
              <div
                style={{ display: "flex", gap: 10, alignItems: "flex-end", height: 140 }}
              >
                {bars.map((b, i) => (
                  <ChartBar
                    key={b.label}
                    label={b.label}
                    pct={b.pct}
                    frame={frame}
                    delay={40 + i * 6}
                    color={i === 5 ? C.accent : `${C.accent}88`}
                  />
                ))}
              </div>
            </div>

            {/* Gauge */}
            <div
              style={{
                flex: 1,
                background: C.surface,
                border: `1px solid ${C.gray200}`,
                borderRadius: 14,
                padding: 20,
                opacity: fadeIn(frame, 35, 55),
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: C.textHeading,
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                Indicador do mês
              </div>
              <GaugeMock frame={frame} />
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </SceneWrapper>
  );
};

const GaugeMock: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const s = spring({ fps, frame: frame - 50, config: { damping: 18 } });
  const pct = interpolate(s, [0, 1], [0, 0.72]);
  const cx = 70, cy = 80, r = 52;
  const arcLength = Math.PI * r;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <svg width={140} height={100} viewBox="0 0 140 100">
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          stroke={C.gray300}
          strokeWidth={10}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          stroke={C.green}
          strokeWidth={10}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${pct * arcLength} ${arcLength}`}
        />
        <circle cx={cx} cy={cy} r={4} fill={C.textHeading} />
        <line
          x1={cx}
          y1={cy}
          x2={cx + r * 0.75 * Math.cos(Math.PI - pct * Math.PI)}
          y2={cy - r * 0.75 * Math.sin(Math.PI - pct * Math.PI)}
          stroke={C.textHeading}
          strokeWidth={2.4}
          strokeLinecap="round"
        />
      </svg>
      <div>
        <div
          style={{
            fontSize: 11,
            color: C.inkSoft,
            textTransform: "uppercase",
            letterSpacing: "0.4px",
          }}
        >
          vs mês anterior
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            fontFamily: "monospace",
            color: C.textHeading,
          }}
        >
          +14.2%
        </div>
        <div
          style={{
            background: C.redSoft,
            color: C.red,
            borderRadius: 20,
            padding: "3px 10px",
            fontSize: 12,
            fontWeight: 600,
            display: "inline-block",
            marginTop: 6,
          }}
        >
          ↑ acima do mês anterior
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// SCENE 3 — EMPLOYEES (150f)
// ══════════════════════════════════════════════════════════════════════════════
const EmployeesScene: React.FC = () => {
  const frame = useCurrentFrame();

  const employees = [
    { name: "Carlos Oliveira", phone: "(98) 99876-5432", role: "Motorista", status: "Ativo" },
    { name: "Ana Souza", phone: "(98) 98765-4321", role: "Entregadora", status: "Ativo" },
    { name: "João Silva", phone: "(98) 97654-3210", role: "Motorista", status: "Inativo" },
    { name: "Maria Santos", phone: "(98) 96543-2109", role: "Supervisora", status: "Ativo" },
    { name: "Pedro Lima", phone: "(98) 95432-1098", role: "Motorista", status: "Ativo" },
  ];

  return (
    <SceneWrapper>
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "80px 120px",
        }}
      >
        <SectionTitle
          title="Gestão de Funcionários"
          sub="Cadastro"
          frame={frame}
          accent={C.green}
        />

        {/* Panel */}
        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.gray200}`,
            borderRadius: 16,
            overflow: "hidden",
            opacity: fadeIn(frame, 10, 30),
            flex: 1,
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: "flex",
              gap: 0,
              padding: "10px 16px",
              borderBottom: `2px solid ${C.gray200}`,
            }}
          >
            {["Nome", "Telefone", "Cargo", "Status", "Cadastrado em", "Ações"].map(
              (h, i) => (
                <div
                  key={h}
                  style={{
                    flex: i === 0 ? 2 : 1,
                    fontSize: 11,
                    color: C.inkSoft,
                    textTransform: "uppercase",
                    letterSpacing: "0.4px",
                    fontWeight: 600,
                  }}
                >
                  {h}
                </div>
              )
            )}
          </div>
          {employees.map((e, i) => (
            <TableRow
              key={e.name}
              cells={[
                e.name,
                e.phone,
                e.role,
                "",
                "15/01/2025",
              ]}
              badge={
                e.status === "Ativo"
                  ? { text: "Ativo", color: C.green, bg: C.greenSoft }
                  : { text: "Inativo", color: C.red, bg: C.redSoft }
              }
              frame={frame}
              delay={15 + i * 12}
            />
          ))}
        </div>

        {/* Add button hint */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: 18,
            opacity: fadeIn(frame, 80, 100),
          }}
        >
          <div
            style={{
              background: C.green,
              color: C.white,
              borderRadius: 24,
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            + Novo Funcionário
          </div>
        </div>
      </AbsoluteFill>
    </SceneWrapper>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// SCENE 4 — REFUELING FORM (150f)
// ══════════════════════════════════════════════════════════════════════════════
const RefuelingScene: React.FC = () => {
  const frame = useCurrentFrame();

  const fields = [
    { label: "Data do abastecimento", value: "24/06/2025", delay: 20 },
    { label: "Funcionário", value: "Carlos Oliveira", delay: 30 },
    { label: "Valor abastecido", value: "R$ 180,00", delay: 40 },
    { label: "Observação", value: "Posto Shell — Av. Litorânea", delay: 50 },
  ];

  return (
    <SceneWrapper>
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          padding: "80px 120px",
          gap: 80,
        }}
      >
        {/* Left text */}
        <div style={{ flex: 1 }}>
          <SectionTitle
            title={"Registre\nabastecimentos\ncom rapidez"}
            sub="Lançamento"
            frame={frame}
            accent={C.amber}
          />
          <div
            style={{
              fontSize: 18,
              color: C.inkSoft,
              lineHeight: 1.7,
              opacity: fadeIn(frame, 20, 40),
            }}
          >
            Formulário simples e direto.
            <br />
            Data, funcionário, valor e observação.
            <br />
            Salvo diretamente na planilha Google.
          </div>
        </div>

        {/* Form card */}
        <div
          style={{
            flex: 1,
            background: C.surface,
            border: `1px solid ${C.gray200}`,
            borderRadius: 16,
            padding: 32,
            opacity: fadeIn(frame, 8, 28),
            transform: `translateY(${slideUp(frame, 8, 28, 30)}px)`,
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: C.textHeading,
              fontFamily: "'Sora', sans-serif",
              marginBottom: 24,
            }}
          >
            Registrar abastecimento
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            {fields.map((f) => (
              <div
                key={f.label}
                style={{
                  gridColumn: f.label === "Observação" ? "1 / -1" : undefined,
                  opacity: fadeIn(frame, f.delay, f.delay + 15),
                  transform: `translateY(${slideUp(frame, f.delay, f.delay + 15, 16)}px)`,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: C.textLabel,
                    marginBottom: 6,
                  }}
                >
                  {f.label}
                </div>
                <div
                  style={{
                    border: `1.5px solid ${f.label === "Valor abastecido" ? C.accent : C.gray300}`,
                    borderRadius: 10,
                    padding: "11px 13px",
                    fontSize: 14,
                    color: C.ink,
                    background: C.surface2,
                    boxShadow:
                      f.label === "Valor abastecido"
                        ? `0 0 0 3px ${C.accentSoft}`
                        : "none",
                  }}
                >
                  {f.value}
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              marginTop: 20,
              opacity: fadeIn(frame, 70, 90),
            }}
          >
            <div
              style={{
                background: C.surface2,
                color: C.inkSoft,
                borderRadius: 24,
                padding: "10px 18px",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Limpar
            </div>
            <div
              style={{
                background: C.accent,
                color: C.white,
                borderRadius: 24,
                padding: "10px 20px",
                fontSize: 13,
                fontWeight: 600,
                boxShadow: "0 4px 14px rgba(47,134,214,0.4)",
              }}
            >
              ✓ Salvar abastecimento
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </SceneWrapper>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// SCENE 5 — HISTORY (150f)
// ══════════════════════════════════════════════════════════════════════════════
const HistoryScene: React.FC = () => {
  const frame = useCurrentFrame();

  const rows = [
    { date: "24/06/2025", name: "Carlos Oliveira", value: "R$ 180,00", obs: "Posto Shell" },
    { date: "23/06/2025", name: "Ana Souza", value: "R$ 95,50", obs: "Auto Posto BR" },
    { date: "23/06/2025", name: "João Silva", value: "R$ 220,00", obs: "Posto Ipiranga" },
    { date: "22/06/2025", name: "Maria Santos", value: "R$ 310,00", obs: "Posto Petrobras" },
    { date: "21/06/2025", name: "Pedro Lima", value: "R$ 140,75", obs: "Posto Shell" },
    { date: "20/06/2025", name: "Carlos Oliveira", value: "R$ 200,00", obs: "Auto Posto BR" },
  ];

  return (
    <SceneWrapper>
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "70px 100px",
        }}
      >
        <SectionTitle
          title="Histórico completo"
          sub="Histórico"
          frame={frame}
          accent={C.accent}
        />

        {/* Filter bar */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 16,
            opacity: fadeIn(frame, 10, 30),
          }}
        >
          {["Funcionário", "Mês", "De", "Até", "Valor mín.", "Valor máx."].map(
            (f) => (
              <div
                key={f}
                style={{
                  background: C.surface,
                  border: `1px solid ${C.gray200}`,
                  borderRadius: 10,
                  padding: "8px 14px",
                  fontSize: 12,
                  color: C.inkSoft,
                  fontWeight: 500,
                }}
              >
                {f}
              </div>
            )
          )}
        </div>

        {/* Table */}
        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.gray200}`,
            borderRadius: 14,
            overflow: "hidden",
            flex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              padding: "10px 16px",
              borderBottom: `2px solid ${C.gray200}`,
            }}
          >
            {["Data", "Funcionário", "Valor", "Observação", "Ações"].map(
              (h, i) => (
                <div
                  key={h}
                  style={{
                    flex: i === 1 ? 2 : 1,
                    fontSize: 11,
                    color: C.inkSoft,
                    textTransform: "uppercase",
                    letterSpacing: "0.4px",
                    fontWeight: 600,
                  }}
                >
                  {h}
                </div>
              )
            )}
          </div>
          {rows.map((r, i) => (
            <TableRow
              key={i}
              cells={[r.date, r.name, r.value, r.obs, "✎ ✕"]}
              frame={frame}
              delay={15 + i * 10}
            />
          ))}
        </div>
      </AbsoluteFill>
    </SceneWrapper>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// SCENE 6 — REPORTS (150f)
// ══════════════════════════════════════════════════════════════════════════════
const ReportsScene: React.FC = () => {
  const frame = useCurrentFrame();

  const ranking = [
    { name: "Carlos Oliveira", value: "R$ 1.220", pct: 100, color: C.amber },
    { name: "Maria Santos", value: "R$ 980", pct: 80, color: C.accent },
    { name: "Ana Souza", value: "R$ 740", pct: 61, color: C.accent },
    { name: "Pedro Lima", value: "R$ 590", pct: 48, color: C.accent },
    { name: "João Silva", value: "R$ 430", pct: 35, color: C.accent },
  ];

  return (
    <SceneWrapper>
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "row",
          padding: "70px 100px",
          gap: 60,
        }}
      >
        {/* Left */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <SectionTitle
            title="Relatórios\ndetalhados"
            sub="Relatórios"
            frame={frame}
            accent={C.amber}
          />
          <div
            style={{
              fontSize: 17,
              color: C.inkSoft,
              lineHeight: 1.7,
              opacity: fadeIn(frame, 20, 40),
              marginBottom: 32,
            }}
          >
            Análises por funcionário, mês e período.
            <br />
            Exporte para Excel ou imprima em PDF.
          </div>
          {/* Export buttons */}
          <div
            style={{
              display: "flex",
              gap: 12,
              opacity: fadeIn(frame, 80, 100),
            }}
          >
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.gray300}`,
                color: C.textLabel,
                borderRadius: 24,
                padding: "10px 20px",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Exportar Excel
            </div>
            <div
              style={{
                background: C.accent,
                color: C.white,
                borderRadius: 24,
                padding: "10px 20px",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Imprimir / PDF
            </div>
          </div>
        </div>

        {/* Right: Ranking */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.gray200}`,
              borderRadius: 14,
              padding: 24,
              opacity: fadeIn(frame, 8, 28),
            }}
          >
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: C.textHeading,
                fontFamily: "'Sora', sans-serif",
                marginBottom: 20,
              }}
            >
              Ranking de consumo — Junho/2025
            </div>
            {ranking.map((r, i) => (
              <div
                key={r.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 0",
                  borderBottom: i < ranking.length - 1 ? `1px solid ${C.gray200}` : "none",
                  opacity: fadeIn(frame, 15 + i * 10, 30 + i * 10),
                  transform: `translateX(${interpolate(
                    frame,
                    [15 + i * 10, 30 + i * 10],
                    [20, 0],
                    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                  )}px)`,
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: i === 0 ? "#C9962C" : C.navy900,
                    color: C.white,
                    fontSize: 12,
                    fontFamily: "monospace",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontWeight: 700,
                  }}
                >
                  {i + 1}
                </div>
                <div
                  style={{ flex: 1, fontSize: 13, color: C.textHeading, fontWeight: 500 }}
                >
                  {r.name}
                </div>
                <ProgressBar
                  pct={r.pct}
                  frame={frame}
                  delay={20 + i * 10}
                  color={r.color}
                />
                <div
                  style={{
                    fontSize: 13,
                    fontFamily: "monospace",
                    fontWeight: 700,
                    color: C.textHeading,
                    minWidth: 90,
                    textAlign: "right",
                  }}
                >
                  {r.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </AbsoluteFill>
    </SceneWrapper>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// SCENE 7 — BACKEND (120f)
// ══════════════════════════════════════════════════════════════════════════════
const BackendScene: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <SceneWrapper bg={C.navy800}>
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
          padding: "60px 160px",
        }}
      >
        <div
          style={{
            fontSize: 14,
            color: C.accent,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "2px",
            marginBottom: 16,
            opacity: fadeIn(frame, 0, 15),
          }}
        >
          Tecnologia
        </div>
        <div
          style={{
            fontSize: 48,
            fontWeight: 800,
            color: C.textHeading,
            fontFamily: "'Sora', sans-serif",
            textAlign: "center",
            marginBottom: 20,
            lineHeight: 1.2,
            opacity: fadeIn(frame, 8, 28),
            transform: `translateY(${slideUp(frame, 8, 28, 24)}px)`,
          }}
        >
          Banco de dados no Google Sheets
        </div>
        <div
          style={{
            fontSize: 18,
            color: C.inkSoft,
            textAlign: "center",
            lineHeight: 1.7,
            maxWidth: 660,
            opacity: fadeIn(frame, 20, 40),
            marginBottom: 50,
          }}
        >
          Todos os dados são armazenados em uma planilha Google.
          <br />
          Fácil de auditar, compartilhar e exportar.
        </div>

        {/* Flow diagram */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 30,
            opacity: fadeIn(frame, 35, 55),
          }}
        >
          {/* App box */}
          <div
            style={{
              background: C.surface,
              border: `1.5px solid ${C.accent}`,
              borderRadius: 14,
              padding: "20px 28px",
              textAlign: "center",
              boxShadow: `0 0 24px ${C.accent}33`,
            }}
          >
            <FuelIcon size={42} />
            <div style={{ fontSize: 13, color: C.textHeading, marginTop: 8, fontWeight: 600 }}>
              Painel Web
            </div>
          </div>

          {/* Arrow */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ fontSize: 11, color: C.inkSoft }}>Apps Script</div>
            <div style={{ fontSize: 28, color: C.accent }}>⇄</div>
            <div style={{ fontSize: 11, color: C.inkSoft }}>API REST</div>
          </div>

          {/* Sheets box */}
          <div
            style={{
              background: C.surface,
              border: `1.5px solid ${C.green}`,
              borderRadius: 14,
              padding: "20px 28px",
              textAlign: "center",
              boxShadow: `0 0 24px ${C.green}33`,
            }}
          >
            <svg width={42} height={42} viewBox="0 0 48 48" fill="none">
              <rect width={48} height={48} rx={8} fill="#0F9D58" />
              <rect x={10} y={8} width={28} height={32} rx={2} fill="white" />
              <rect x={14} y={16} width={8} height={6} rx={1} fill="#0F9D58" />
              <rect x={26} y={16} width={8} height={6} rx={1} fill="#0F9D58" />
              <rect x={14} y={26} width={8} height={6} rx={1} fill="#0F9D58" />
              <rect x={26} y={26} width={8} height={6} rx={1} fill="#0F9D58" />
            </svg>
            <div style={{ fontSize: 13, color: C.textHeading, marginTop: 8, fontWeight: 600 }}>
              Google Sheets
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </SceneWrapper>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// SCENE 8 — OUTRO (120f)
// ══════════════════════════════════════════════════════════════════════════════
const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ fps, frame, config: { damping: 14 } });

  const features = [
    "Dashboard com KPIs em tempo real",
    "Gestão completa de funcionários",
    "Registro rápido de abastecimentos",
    "Histórico com filtros avançados",
    "Relatórios e exportação Excel",
    "Banco de dados no Google Sheets",
  ];

  return (
    <SceneWrapper>
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.accentSoft} 0%, transparent 70%)`,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          opacity: 0.5,
        }}
      />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          padding: "80px 120px",
          gap: 80,
        }}
      >
        {/* Left */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: "50%",
              border: `3px solid ${C.accent}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: C.accentSoft,
              boxShadow: `0 0 50px ${C.accent}44`,
              transform: `scale(${interpolate(logoScale, [0, 1], [0.5, 1])})`,
              opacity: fadeIn(frame, 0, 20),
            }}
          >
            <FuelIcon size={90} />
          </div>
          <div
            style={{
              textAlign: "center",
              opacity: fadeIn(frame, 15, 35),
              transform: `translateY(${slideUp(frame, 15, 35, 20)}px)`,
            }}
          >
            <div
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: 52,
                fontWeight: 800,
                color: C.textHeading,
                lineHeight: 1,
              }}
            >
              Combustível
            </div>
            <div
              style={{
                fontSize: 14,
                color: C.accent,
                fontWeight: 600,
                letterSpacing: "3px",
                textTransform: "uppercase",
                marginTop: 8,
              }}
            >
              Painel de Controle
            </div>
          </div>
        </div>

        {/* Right: feature list */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: C.textHeading,
              fontFamily: "'Sora', sans-serif",
              marginBottom: 28,
              opacity: fadeIn(frame, 10, 30),
            }}
          >
            Tudo que você precisa
          </div>
          {features.map((f, i) => (
            <div
              key={f}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "10px 0",
                borderBottom: i < features.length - 1 ? `1px solid ${C.gray200}` : "none",
                opacity: fadeIn(frame, 15 + i * 8, 30 + i * 8),
                transform: `translateX(${interpolate(
                  frame,
                  [15 + i * 8, 30 + i * 8],
                  [24, 0],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                )}px)`,
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: C.greenSoft,
                  color: C.green,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                ✓
              </div>
              <div style={{ fontSize: 16, color: C.ink, fontWeight: 500 }}>{f}</div>
            </div>
          ))}
        </div>
      </AbsoluteFill>

      {/* Bottom accent */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, transparent, ${C.accent}, transparent)`,
          opacity: fadeIn(frame, 60, 90),
        }}
      />
    </SceneWrapper>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// ROOT COMPOSITION
// ══════════════════════════════════════════════════════════════════════════════
export const CombustivelVideo: React.FC = () => {
  return (
    <Series>
      <Series.Sequence durationInFrames={120}>
        <IntroScene />
      </Series.Sequence>
      <Series.Sequence durationInFrames={270}>
        <DashboardScene />
      </Series.Sequence>
      <Series.Sequence durationInFrames={150}>
        <EmployeesScene />
      </Series.Sequence>
      <Series.Sequence durationInFrames={150}>
        <RefuelingScene />
      </Series.Sequence>
      <Series.Sequence durationInFrames={150}>
        <HistoryScene />
      </Series.Sequence>
      <Series.Sequence durationInFrames={150}>
        <ReportsScene />
      </Series.Sequence>
      <Series.Sequence durationInFrames={120}>
        <BackendScene />
      </Series.Sequence>
      <Series.Sequence durationInFrames={150}>
        <OutroScene />
      </Series.Sequence>
    </Series>
  );
};
