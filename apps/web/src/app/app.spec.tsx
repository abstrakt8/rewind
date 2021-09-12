import { render } from "@testing-library/react";

import WebTestApp from "./webTestApp";

describe("App", () => {
  it("should render successfully", () => {
    const { baseElement } = render(<WebTestApp />);

    expect(baseElement).toBeTruthy();
  });

  it("should have a greeting as the title", () => {
    const { getByText } = render(<WebTestApp />);

    expect(getByText("Welcome to web!")).toBeTruthy();
  });
});
