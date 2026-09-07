import { Link } from "react-router-dom";

import {
  primaryAppRoutes,
  primaryRouteIdForPath,
  type PrimaryNavigationIcon,
} from "../routes";

function DockIcon({ name }: { readonly name: PrimaryNavigationIcon }) {
  const common = {
    "aria-hidden": true,
    className: "primary-dock__icon",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
    viewBox: "0 0 24 24",
  };

  switch (name) {
    case "library":
      return (
        <svg {...common}>
          <path d="M4 10.5 12 4l8 6.5v8a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5z" />
          <path d="M9 20v-6h6v6" />
        </svg>
      );
    case "collection":
      return (
        <svg {...common}>
          <path d="M5 5.5h14v14H5zM8.5 5.5v14M12 9h4M12 12.5h4M12 16h4" />
        </svg>
      );
    case "archive":
      return (
        <svg {...common}>
          <path d="M5 6.5h14v13H5zM4 4h16v2.5H4zM9 11h6" />
        </svg>
      );
    case "statistics":
      return (
        <svg {...common}>
          <path d="M5 19V9M12 19V5M19 19v-7M3.5 19.5h17" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.5 1.5M16.5 16.5 18 18M18 6l-1.5 1.5M7.5 16.5 6 18" />
        </svg>
      );
  }
}

export function PrimaryDock({ pathname }: { readonly pathname: string }) {
  const activeRouteId = primaryRouteIdForPath(pathname);

  return (
    <nav aria-label="Navegação principal" className="primary-dock">
      <ul>
        {primaryAppRoutes.map((route) => {
          const active = route.id === activeRouteId;
          return (
            <li key={route.id}>
              <Link
                aria-current={active ? "page" : undefined}
                aria-label={route.primaryNavigation.accessibleLabel}
                className="primary-dock__link"
                to={route.path}
              >
                <DockIcon name={route.primaryNavigation.icon} />
                <span>{route.primaryNavigation.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
