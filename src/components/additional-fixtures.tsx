"use client";
export type ExtraFixture = { name: string; code: string; expectMatch: boolean };
export default function AdditionalFixtures({
  value,
  onChange,
}: {
  value: ExtraFixture[];
  onChange: (v: ExtraFixture[]) => void;
}) {
  return (
    <section className="panel form-panel">
      <h2>Additional examples</h2>
      <p className="muted">
        Challenge the detector with safe variants and other confirmed failures.
        Every example must pass before approval.
      </p>
      {value.map((f, i) => (
        <fieldset
          key={i}
          style={{ border: "none", padding: 0, marginBottom: 24 }}
        >
          <legend>Example {i + 1}</legend>
          <label htmlFor={`fixture-name-${i}`}>Example name</label>
          <input
            id={`fixture-name-${i}`}
            required
            maxLength={80}
            value={f.name}
            onChange={(e) =>
              onChange(
                value.map((x, n) =>
                  n === i ? { ...x, name: e.target.value } : x,
                ),
              )
            }
          />
          <label htmlFor={`fixture-expect-${i}`}>
            Expected detector result
          </label>
          <select
            id={`fixture-expect-${i}`}
            value={String(f.expectMatch)}
            onChange={(e) =>
              onChange(
                value.map((x, n) =>
                  n === i
                    ? { ...x, expectMatch: e.target.value === "true" }
                    : x,
                ),
              )
            }
          >
            <option value="false">Safe code — no match</option>
            <option value="true">Unsafe code — should match</option>
          </select>
          <label htmlFor={`fixture-code-${i}`}>Python code</label>
          <textarea
            id={`fixture-code-${i}`}
            className="code-input"
            required
            minLength={5}
            maxLength={20000}
            rows={4}
            value={f.code}
            onChange={(e) =>
              onChange(
                value.map((x, n) =>
                  n === i ? { ...x, code: e.target.value } : x,
                ),
              )
            }
          />
          <button
            type="button"
            className="text-button"
            onClick={() => onChange(value.filter((_, n) => n !== i))}
          >
            Remove example {i + 1}
          </button>
        </fieldset>
      ))}
      <button
        type="button"
        className="button secondary"
        disabled={value.length >= 8}
        onClick={() =>
          onChange([...value, { name: "", code: "", expectMatch: false }])
        }
      >
        Add example ({value.length}/8)
      </button>
    </section>
  );
}
