"use client";

import { useState } from "react";

// Вкладки на странице матча. Содержимое всех вкладок есть на странице, показывается выбранная.
export default function MatchTabs({ tabs }) {
  const [active, setActive] = useState(tabs[0].id);
  return (
    <>
      <div className="subtabs" role="tablist">
        {tabs.map((tb) => (
          <button
            key={tb.id}
            type="button"
            role="tab"
            aria-selected={active === tb.id}
            className={"subtab" + (active === tb.id ? " active" : "")}
            onClick={() => setActive(tb.id)}
          >
            {tb.label}
          </button>
        ))}
      </div>
      {tabs.map((tb) => (
        <div key={tb.id} hidden={active !== tb.id}>
          {tb.content}
        </div>
      ))}
    </>
  );
}
