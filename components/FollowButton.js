"use client";

import { useFavorites } from "@/lib/favorites";

// Кнопка-звёздочка «Подписаться» на странице клуба
export default function FollowButton({ team, followLabel, followingLabel }) {
  const { ids, toggle } = useFavorites();
  const on = ids.includes(team.id);
  return (
    <button
      type="button"
      className={"follow" + (on ? " on" : "")}
      aria-pressed={on}
      onClick={() => toggle(team)}
    >
      {on ? "★ " : "☆ "}
      {on ? followingLabel : followLabel}
    </button>
  );
}
