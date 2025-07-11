import SectionTitle from "./section-title";

export default function Overview() {
  return (
    <div>
      <div>
        <p>
          This SDK provides comprehensive analysis of Aiken libraries including:
        </p>
        <ul>
          <li>
            <strong>Standard Library:</strong> Core Aiken standard library
            functions and types
          </li>
          <li>
            <strong>Prelude:</strong> Essential Aiken prelude functions and
            built-ins
          </li>
          <li>
            <strong>Vodka:</strong> Utility library for Aiken development with
            cocktail (onchain) and mocktail (testing) functions
          </li>
        </ul>
        <p>The analysis distinguishes between:</p>
        <ul>
          <li>
            <strong>Functions:</strong> Public API functions that can be
            imported by other modules
          </li>
          <li>
            <strong>Atoms:</strong> Private implementation functions that are
            internal building blocks
          </li>
          <li>
            <strong>Types:</strong> Public type definitions available for import
          </li>
          <li>
            <strong>Constants:</strong> Public constants that can be used by
            other modules
          </li>
        </ul>
        <p>
          For the Vodka library, the system tracks re-export relationships where
          internal functions are exposed through simplified names in the{" "}
          <code>cocktail</code> and <code>mocktail</code> modules.
        </p>
      </div>
    </div>
  );
}
